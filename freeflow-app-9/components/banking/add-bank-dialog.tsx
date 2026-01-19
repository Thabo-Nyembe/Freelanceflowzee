/**
 * Add Bank Dialog - FreeFlow A+++ Implementation
 * Plaid Link integration for connecting bank accounts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBankConnections } from '@/lib/hooks/use-bank-connections';
import { toast } from 'sonner';

interface AddBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogState = 'intro' | 'loading' | 'success' | 'error';

export function AddBankDialog({ open, onOpenChange }: AddBankDialogProps) {
  const { createLinkToken, exchangeToken } = useBankConnections();
  const [state, setState] = useState<DialogState>('intro');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkHandler, setLinkHandler] = useState<{ open: () => void; exit: () => void } | null>(null);

  // Load Plaid script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingScript = document.getElementById('plaid-link-script');
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = 'plaid-link-script';
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const scriptElement = document.getElementById('plaid-link-script');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  // Handle Plaid success
  const handleSuccess = useCallback(async (publicToken: string, metadata: unknown) => {
    setState('loading');
    const typedMetadata = metadata as {
      institution?: { institution_id: string; name: string };
      accounts?: Array<{ id: string; name: string; mask?: string; type: string; subtype?: string }>;
    };

    const result = await exchangeToken(publicToken, {
      institution: typedMetadata.institution,
      accounts: typedMetadata.accounts,
    });

    if (result) {
      setState('success');
      setTimeout(() => {
        onOpenChange(false);
        setState('intro');
      }, 2000);
    } else {
      setState('error');
      setErrorMessage('Failed to connect bank account. Please try again.');
    }
  }, [exchangeToken, onOpenChange]);

  // Handle Plaid exit
  const handleExit = useCallback((error: { error_code?: string; display_message?: string } | null) => {
    if (error) {
      toast.error(error.display_message || 'Connection was cancelled');
    }
    setLinkHandler(null);
  }, []);

  // Initialize Plaid Link
  const initializePlaid = useCallback(async () => {
    setState('loading');

    const linkToken = await createLinkToken();
    if (!linkToken) {
      setState('error');
      setErrorMessage('Failed to initialize bank connection. Please try again.');
      return;
    }

    // Wait for Plaid script to load
    const maxAttempts = 20;
    let attempts = 0;

    const waitForPlaid = () => {
      const Plaid = (window as unknown as { Plaid?: { create: (config: unknown) => { open: () => void; exit: () => void } } }).Plaid;
      if (Plaid) {
        const handler = Plaid.create({
          token: linkToken,
          onSuccess: handleSuccess,
          onExit: handleExit,
          onEvent: (eventName: string) => {
            console.log('Plaid event:', eventName);
          },
        });
        setLinkHandler(handler);
        setState('intro');
        handler.open();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(waitForPlaid, 100);
      } else {
        setState('error');
        setErrorMessage('Failed to load Plaid. Please refresh the page.');
      }
    };

    waitForPlaid();
  }, [createLinkToken, handleSuccess, handleExit]);

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && linkHandler) {
      linkHandler.exit();
      setLinkHandler(null);
    }
    if (!newOpen) {
      setState('intro');
      setErrorMessage(null);
    }
    onOpenChange(newOpen);
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Connecting to your bank...</p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Bank Connected!</h3>
            <p className="text-muted-foreground text-center">
              Your bank account has been successfully connected.
              Transactions will start syncing shortly.
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
            <p className="text-muted-foreground text-center mb-4">
              {errorMessage || 'Something went wrong. Please try again.'}
            </p>
            <Button onClick={() => setState('intro')}>Try Again</Button>
          </div>
        );

      default:
        return (
          <>
            <div className="flex flex-col items-center py-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Your Bank</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">
                Securely connect your bank account to automatically import transactions
                and track your finances in real-time.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Bank-Level Security</p>
                  <p className="text-xs text-muted-foreground">
                    We use Plaid, trusted by millions, to securely connect to your bank.
                    Your credentials are never stored on our servers.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">What you can do:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Auto-import transactions daily
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Categorize expenses automatically with AI
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Match transactions to invoices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Track income and expenses in real-time
                  </li>
                </ul>
              </div>

              <Button onClick={initializePlaid} className="w-full" size="lg">
                Connect Bank Account
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to allow FreeFlow to access your financial data
                for the purposes described above.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state === 'success' ? 'Success' : state === 'error' ? 'Error' : 'Add Bank Account'}
          </DialogTitle>
          {state === 'intro' && (
            <DialogDescription>
              Connect your bank to automatically sync transactions
            </DialogDescription>
          )}
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
