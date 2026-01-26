'use client';

/**
 * Recurring Invoices Page - FreeFlow A+++ Implementation
 * Main dashboard page for managing recurring invoice templates
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { RecurringInvoiceList } from '@/components/invoices/recurring-invoice-list';
import { RecurringInvoiceForm } from '@/components/invoices/recurring-invoice-form';
import { RecurringInvoiceDetails } from '@/components/invoices/recurring-invoice-details';
import {
  useRecurringInvoices,
  RecurringTemplate,
  CreateTemplateInput,
  UpdateTemplateInput,
} from '@/lib/hooks/use-recurring-invoices';

type ViewState =
  | { type: 'list' }
  | { type: 'details'; templateId: string }
  | { type: 'create' }
  | { type: 'edit'; template: RecurringTemplate };

export default function RecurringInvoicesPage() {
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  const [clients, setClients] = useState<Array<{ id: string; name: string; email: string; company?: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    pauseTemplate,
    resumeTemplate,
  } = useRecurringInvoices();

  // Fetch clients for the form
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients?limit=100');
        const result = await response.json();
        if (result.data) {
          setClients(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };
    fetchClients();
  }, []);

  const handleCreateNew = useCallback(() => {
    setViewState({ type: 'create' });
  }, []);

  const handleEdit = useCallback((template: RecurringTemplate) => {
    setViewState({ type: 'edit', template });
  }, []);

  const handleViewDetails = useCallback((template: RecurringTemplate) => {
    setViewState({ type: 'details', templateId: template.id });
  }, []);

  const handleBack = useCallback(() => {
    setViewState({ type: 'list' });
  }, []);

  const handleFormSubmit = useCallback(async (data: CreateTemplateInput | UpdateTemplateInput) => {
    setIsSubmitting(true);
    try {
      if (viewState.type === 'edit') {
        const result = await updateTemplate(viewState.template.id, data);
        if (result) {
          setViewState({ type: 'details', templateId: viewState.template.id });
        }
      } else {
        const result = await createTemplate(data as CreateTemplateInput);
        if (result) {
          setViewState({ type: 'details', templateId: result.id });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [viewState, createTemplate, updateTemplate]);

  const handleFormCancel = useCallback(() => {
    if (viewState.type === 'edit') {
      setViewState({ type: 'details', templateId: viewState.template.id });
    } else {
      setViewState({ type: 'list' });
    }
  }, [viewState]);

  // Render based on view state
  if (viewState.type === 'details') {
    return (
      <div className="container mx-auto py-6 px-4">
        <RecurringInvoiceDetails
          templateId={viewState.templateId}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={deleteTemplate}
          onPause={pauseTemplate}
          onResume={resumeTemplate}
        />
      </div>
    );
  }

  const isFormOpen = viewState.type === 'create' || viewState.type === 'edit';

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Recurring Invoices</h1>
        <p className="text-muted-foreground mt-1">
          Automate your billing with recurring invoice templates
        </p>
      </div>

      <RecurringInvoiceList
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onViewDetails={handleViewDetails}
      />

      {/* Create/Edit Sheet */}
      <Sheet open={isFormOpen} onOpenChange={(open) => !open && handleFormCancel()}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {viewState.type === 'edit' ? 'Edit Template' : 'Create Recurring Invoice'}
            </SheetTitle>
            <SheetDescription>
              {viewState.type === 'edit'
                ? 'Update the recurring invoice template settings'
                : 'Set up automatic invoice generation on a schedule'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <RecurringInvoiceForm
              template={viewState.type === 'edit' ? viewState.template : null}
              clients={clients}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
