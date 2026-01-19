'use client';

/**
 * RecurringInvoiceForm - FreeFlow A+++ Implementation
 * Complete form for creating/editing recurring invoice templates
 * Features: Line items, scheduling options, email settings, validation
 */

import { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Trash2, Calendar, DollarSign, Mail, Save,
  ChevronDown, ChevronUp, GripVertical, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  RecurringTemplate,
  CreateTemplateInput,
  UpdateTemplateInput,
  FREQUENCY_LABELS,
} from '@/lib/hooks/use-recurring-invoices';

// ============ Form Schema ============

const lineItemSchema = z.object({
  id: z.string().optional(),
  item_name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  quantity: z.number().min(0.001, 'Quantity must be positive'),
  unit_price: z.number().min(0, 'Price cannot be negative'),
  unit: z.string().optional(),
  taxable: z.boolean().default(true),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().min(0).default(0),
  sort_order: z.number().default(0),
});

const formSchema = z.object({
  template_name: z.string().min(1, 'Template name is required'),
  template_code: z.string().optional(),
  description: z.string().optional(),
  client_id: z.string().optional(),
  client_name: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal('')),
  client_address: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'biannually', 'annually', 'custom']),
  custom_interval_days: z.number().min(1).optional().nullable(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
  day_of_week: z.number().min(0).max(6).optional().nullable(),
  day_of_month: z.number().min(1).max(31).optional().nullable(),
  month_of_year: z.number().min(1).max(12).optional().nullable(),
  invoice_prefix: z.string().default('INV'),
  currency: z.string().default('USD'),
  tax_rate: z.number().min(0).max(100).default(0),
  discount_type: z.enum(['percentage', 'fixed']).default('percentage'),
  discount_value: z.number().min(0).default(0),
  payment_terms_days: z.number().min(0).default(30),
  late_fee_enabled: z.boolean().default(false),
  late_fee_percentage: z.number().min(0).max(100).default(0),
  late_fee_grace_days: z.number().min(0).default(0),
  auto_send: z.boolean().default(false),
  send_days_before: z.number().min(0).default(0),
  cc_emails: z.array(z.string().email()).optional(),
  bcc_emails: z.array(z.string().email()).optional(),
  email_subject_template: z.string().optional(),
  email_body_template: z.string().optional(),
  notes: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

type FormData = z.infer<typeof formSchema>;

interface RecurringInvoiceFormProps {
  template?: RecurringTemplate | null;
  clients?: Array<{ id: string; name: string; email: string; company?: string }>;
  onSubmit: (data: CreateTemplateInput | UpdateTemplateInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// ============ Component ============

export function RecurringInvoiceForm({
  template,
  clients = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RecurringInvoiceFormProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const isEditing = !!template;

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: template ? {
      template_name: template.template_name,
      template_code: template.template_code || '',
      description: template.description || '',
      client_id: template.client_id || '',
      client_name: template.client_name || '',
      client_email: template.client_email || '',
      client_address: template.client_address || '',
      frequency: template.frequency,
      custom_interval_days: template.custom_interval_days,
      start_date: template.start_date,
      end_date: template.end_date || '',
      day_of_week: template.day_of_week,
      day_of_month: template.day_of_month,
      month_of_year: template.month_of_year,
      invoice_prefix: template.invoice_prefix,
      currency: template.currency,
      tax_rate: template.tax_rate,
      discount_type: template.discount_type,
      discount_value: template.discount_value,
      payment_terms_days: template.payment_terms_days,
      late_fee_enabled: template.late_fee_enabled,
      late_fee_percentage: template.late_fee_percentage,
      late_fee_grace_days: template.late_fee_grace_days,
      auto_send: template.auto_send,
      send_days_before: template.send_days_before,
      cc_emails: template.cc_emails || [],
      bcc_emails: template.bcc_emails || [],
      email_subject_template: template.email_subject_template || '',
      email_body_template: template.email_body_template || '',
      notes: template.notes || '',
      terms_and_conditions: template.terms_and_conditions || '',
      line_items: template.line_items?.map((item, index) => ({
        ...item,
        sort_order: item.sort_order || index,
      })) || [],
    } : {
      template_name: '',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      invoice_prefix: 'INV',
      currency: 'USD',
      tax_rate: 0,
      discount_type: 'percentage',
      discount_value: 0,
      payment_terms_days: 30,
      late_fee_enabled: false,
      late_fee_percentage: 0,
      late_fee_grace_days: 0,
      auto_send: false,
      send_days_before: 0,
      cc_emails: [],
      bcc_emails: [],
      line_items: [
        {
          item_name: '',
          description: '',
          quantity: 1,
          unit_price: 0,
          taxable: true,
          discount_value: 0,
          sort_order: 0,
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'line_items',
  });

  const watchedItems = form.watch('line_items');
  const watchedTaxRate = form.watch('tax_rate');
  const watchedDiscountType = form.watch('discount_type');
  const watchedDiscountValue = form.watch('discount_value');
  const watchedFrequency = form.watch('frequency');
  const watchedAutoSend = form.watch('auto_send');
  const watchedLateFeeEnabled = form.watch('late_fee_enabled');
  const watchedClientId = form.watch('client_id');

  // Calculate totals
  const totals = useCallback(() => {
    let subtotal = 0;
    let taxAmount = 0;
    let itemDiscount = 0;

    watchedItems.forEach(item => {
      const itemSubtotal = item.quantity * item.unit_price;
      subtotal += itemSubtotal;

      // Item-level discount
      if (item.discount_value > 0) {
        const discount = item.discount_type === 'percentage'
          ? itemSubtotal * (item.discount_value / 100)
          : item.discount_value;
        itemDiscount += discount;
      }

      // Tax
      if (item.taxable) {
        const taxRate = item.tax_rate ?? watchedTaxRate;
        const taxableAmount = itemSubtotal - (item.discount_value > 0
          ? (item.discount_type === 'percentage' ? itemSubtotal * (item.discount_value / 100) : item.discount_value)
          : 0);
        taxAmount += taxableAmount * (taxRate / 100);
      }
    });

    // Invoice-level discount
    let invoiceDiscount = 0;
    if (watchedDiscountValue > 0) {
      invoiceDiscount = watchedDiscountType === 'percentage'
        ? subtotal * (watchedDiscountValue / 100)
        : watchedDiscountValue;
    }

    const total = subtotal - itemDiscount - invoiceDiscount + taxAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount: itemDiscount + invoiceDiscount,
      total: Math.max(0, total),
    };
  }, [watchedItems, watchedTaxRate, watchedDiscountType, watchedDiscountValue]);

  // Handle client selection
  useEffect(() => {
    if (watchedClientId) {
      const client = clients.find(c => c.id === watchedClientId);
      if (client) {
        form.setValue('client_name', client.name);
        form.setValue('client_email', client.email);
      }
    }
  }, [watchedClientId, clients, form]);

  // Form submit
  const handleSubmit = async (data: FormData) => {
    const submitData = {
      ...data,
      client_email: data.client_email || undefined,
      end_date: data.end_date || undefined,
      custom_interval_days: data.frequency === 'custom' ? data.custom_interval_days : undefined,
    };
    await onSubmit(submitData as CreateTemplateInput);
  };

  const { subtotal, taxAmount, discountAmount, total } = totals();

  return (
    <TooltipProvider>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>
              Basic information about this recurring invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template_name">Template Name *</Label>
                <Input
                  id="template_name"
                  placeholder="e.g., Monthly Retainer - Acme Corp"
                  {...form.register('template_name')}
                />
                {form.formState.errors.template_name && (
                  <p className="text-sm text-red-500">{form.formState.errors.template_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="template_code">Template Code</Label>
                <Input
                  id="template_code"
                  placeholder="e.g., RET-001"
                  {...form.register('template_code')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description of this recurring invoice"
                rows={2}
                {...form.register('description')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Existing Client</Label>
                  <Controller
                    name="client_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No client selected</SelectItem>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} {client.company ? `(${client.company})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  placeholder="Client or company name"
                  {...form.register('client_name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Client Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="client@example.com"
                  {...form.register('client_email')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_address">Client Address</Label>
              <Textarea
                id="client_address"
                placeholder="Billing address"
                rows={2}
                {...form.register('client_address')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule
            </CardTitle>
            <CardDescription>
              When and how often to generate invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Frequency *</Label>
                <Controller
                  name="frequency"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {watchedFrequency === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Interval (Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    {...form.register('custom_interval_days', { valueAsNumber: true })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...form.register('start_date')}
                />
                {form.formState.errors.start_date && (
                  <p className="text-sm text-red-500">{form.formState.errors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...form.register('end_date')}
                />
              </div>
            </div>

            {(watchedFrequency === 'weekly' || watchedFrequency === 'biweekly') && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Controller
                  name="day_of_week"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ''}
                      onValueChange={v => field.onChange(v ? parseInt(v) : null)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                          <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {(watchedFrequency === 'monthly' || watchedFrequency === 'quarterly' || watchedFrequency === 'biannually') && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  className="w-24"
                  placeholder="1-31"
                  {...form.register('day_of_month', { valueAsNumber: true })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Line Items
            </CardTitle>
            <CardDescription>
              Items that will appear on each generated invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-3 relative group"
              >
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-4">
                    <Label className="text-xs text-muted-foreground">Item Name *</Label>
                    <Input
                      placeholder="Service or product name"
                      {...form.register(`line_items.${index}.item_name`)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <Input
                      type="number"
                      step="0.001"
                      min={0.001}
                      {...form.register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...form.register(`line_items.${index}.unit_price`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Tax Rate %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      placeholder={`${watchedTaxRate}%`}
                      {...form.register(`line_items.${index}.tax_rate`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Subtotal</Label>
                      <div className="h-10 flex items-center font-medium">
                        ${((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unit_price || 0)).toFixed(2)}
                      </div>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-8">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <Input
                      placeholder="Optional description"
                      {...form.register(`line_items.${index}.description`)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Unit</Label>
                    <Input
                      placeholder="hour, unit..."
                      {...form.register(`line_items.${index}.unit`)}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Controller
                        name={`line_items.${index}.taxable`}
                        control={form.control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <span className="text-sm">Taxable</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({
                item_name: '',
                description: '',
                quantity: 1,
                unit_price: 0,
                taxable: true,
                discount_value: 0,
                sort_order: fields.length,
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Line Item
            </Button>

            {form.formState.errors.line_items && (
              <p className="text-sm text-red-500">
                {form.formState.errors.line_items.message || 'Please check line items'}
              </p>
            )}

            {/* Totals Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex flex-col items-end gap-2">
                <div className="flex justify-between w-48">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between w-48 text-green-600">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-48">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Advanced Options</CardTitle>
                    <CardDescription>Payment terms, late fees, and invoice settings</CardDescription>
                  </div>
                  {advancedOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Invoice Prefix</Label>
                    <Input
                      placeholder="INV"
                      {...form.register('invoice_prefix')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Controller
                      name="currency"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms (Days)</Label>
                    <Input
                      type="number"
                      min={0}
                      {...form.register('payment_terms_days', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      {...form.register('tax_rate', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Discount</Label>
                    <div className="flex gap-2">
                      <Controller
                        name="discount_type"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">%</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        className="flex-1"
                        {...form.register('discount_value', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                {/* Late Fees */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Controller
                      name="late_fee_enabled"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <div>
                      <p className="font-medium">Enable Late Fees</p>
                      <p className="text-sm text-muted-foreground">Automatically add late fees to overdue invoices</p>
                    </div>
                  </label>

                  {watchedLateFeeEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-12">
                      <div className="space-y-2">
                        <Label>Late Fee Percentage</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          max={100}
                          {...form.register('late_fee_percentage', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Grace Period (Days)</Label>
                        <Input
                          type="number"
                          min={0}
                          {...form.register('late_fee_grace_days', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Notes to appear on the invoice"
                      rows={3}
                      {...form.register('notes')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Terms & Conditions</Label>
                    <Textarea
                      placeholder="Payment terms and conditions"
                      rows={3}
                      {...form.register('terms_and_conditions')}
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Email Settings */}
        <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <div>
                      <CardTitle>Email Delivery</CardTitle>
                      <CardDescription>Automatic sending options</CardDescription>
                    </div>
                  </div>
                  {emailOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Controller
                    name="auto_send"
                    control={form.control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div>
                    <p className="font-medium">Auto-send Invoices</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically email invoices when generated
                    </p>
                  </div>
                </label>

                {watchedAutoSend && (
                  <div className="space-y-4 pl-12">
                    <div className="space-y-2">
                      <Label>Send Days Before Due Date</Label>
                      <Input
                        type="number"
                        min={0}
                        className="w-32"
                        {...form.register('send_days_before', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-muted-foreground">
                        0 = send immediately when generated
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Email Subject Template</Label>
                      <Input
                        placeholder="Invoice {{invoice_number}} from {{company_name}}"
                        {...form.register('email_subject_template')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Body Template</Label>
                      <Textarea
                        placeholder="Custom email message. Use {{client_name}}, {{amount}}, {{due_date}}"
                        rows={4}
                        {...form.register('email_body_template')}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 sticky bottom-0 p-4 bg-background border-t -mx-4 -mb-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Template' : 'Create Template'}
              </>
            )}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
