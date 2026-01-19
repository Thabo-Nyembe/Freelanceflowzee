/**
 * Bank Connections Page - FreeFlow A+++ Implementation
 * Complete bank account management with Plaid integration
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Receipt, Settings } from 'lucide-react';
import { BankConnectionsList, AddBankDialog, TransactionList } from '@/components/banking';

export default function BankConnectionsPage() {
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Connections</h1>
          <p className="text-muted-foreground">
            Connect your bank accounts to automatically import and categorize transactions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <BankConnectionsList onAddBank={() => setAddBankOpen(true)} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionList />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <CategorizationRules />
        </TabsContent>
      </Tabs>

      {/* Add Bank Dialog */}
      <AddBankDialog open={addBankOpen} onOpenChange={setAddBankOpen} />
    </div>
  );
}

// Categorization Rules Component
function CategorizationRules() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Categorization Rules</h2>
          <p className="text-sm text-muted-foreground">
            Create rules to automatically categorize transactions based on merchant or description
          </p>
        </div>
      </div>

      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Custom categorization rules are being built. In the meantime, transactions are
          automatically categorized using AI and Plaid's category data.
        </p>
      </div>
    </div>
  );
}
