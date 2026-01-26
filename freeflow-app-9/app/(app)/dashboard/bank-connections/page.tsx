/**
 * Bank Connections Page - FreeFlow A+++ Implementation
 * Complete bank account management with Plaid integration
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building2, Receipt, Settings, Plus, Trash2, Play, Edit, CheckCircle, XCircle, Filter, RefreshCw } from 'lucide-react';
import { BankConnectionsList, AddBankDialog, TransactionList } from '@/components/banking';
import { useCategorizationRules, TRANSACTION_CATEGORIES, type CreateRuleInput, type CategorizationRule } from '@/lib/hooks/use-bank-connections';
import { toast } from 'sonner';

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

// Categorization Rules Component - Fully Wired
function CategorizationRules() {
  const {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    applyRules,
    refresh
  } = useCategorizationRules();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CategorizationRule | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<CreateRuleInput>({
    name: '',
    match_field: 'description',
    match_type: 'contains',
    match_value: '',
    category: '',
    subcategory: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      match_field: 'description',
      match_type: 'contains',
      match_value: '',
      category: '',
      subcategory: '',
    });
    setEditingRule(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.match_value || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingRule) {
      await updateRule(editingRule.id, formData);
    } else {
      await createRule(formData);
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = (rule: CategorizationRule) => {
    setFormData({
      name: rule.name,
      match_field: rule.match_field,
      match_type: rule.match_type,
      match_value: rule.match_value,
      category: rule.category,
      subcategory: rule.subcategory,
    });
    setEditingRule(rule);
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id);
    }
  };

  const handleApplyRules = async () => {
    setIsApplying(true);
    await applyRules();
    setIsApplying(false);
  };

  const handleTestRules = () => {
    if (!testText.trim()) {
      toast.error('Enter some text to test');
      return;
    }

    const results: Record<string, boolean> = {};
    rules.forEach(rule => {
      const text = testText.toLowerCase();
      const value = rule.match_value.toLowerCase();

      switch (rule.match_type) {
        case 'contains':
          results[rule.id] = text.includes(value);
          break;
        case 'equals':
          results[rule.id] = text === value;
          break;
        case 'starts_with':
          results[rule.id] = text.startsWith(value);
          break;
        case 'regex':
          try {
            results[rule.id] = new RegExp(rule.match_value, 'i').test(testText);
          } catch {
            results[rule.id] = false;
          }
          break;
        default:
          results[rule.id] = false;
      }
    });

    setTestResults(results);
    const matchCount = Object.values(results).filter(Boolean).length;
    toast.success(`${matchCount} rule(s) matched`);
  };

  const selectedCategory = TRANSACTION_CATEGORIES.find(c => c.id === formData.category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Categorization Rules</h2>
          <p className="text-sm text-muted-foreground">
            Create rules to automatically categorize transactions based on merchant or description
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleApplyRules} disabled={isApplying || rules.length === 0}>
            <Play className={`h-4 w-4 mr-2 ${isApplying ? 'animate-pulse' : ''}`} />
            Apply Rules
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Edit Rule' : 'Create Categorization Rule'}</DialogTitle>
                <DialogDescription>
                  Define a rule to automatically categorize transactions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Uber Rides"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Match Field</Label>
                    <Select value={formData.match_field} onValueChange={(v) => setFormData(prev => ({ ...prev, match_field: v as CreateRuleInput['match_field'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="merchant">Merchant</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Match Type</Label>
                    <Select value={formData.match_type} onValueChange={(v) => setFormData(prev => ({ ...prev, match_type: v as CreateRuleInput['match_type'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="starts_with">Starts With</SelectItem>
                        <SelectItem value="regex">Regex</SelectItem>
                        {formData.match_field === 'amount' && (
                          <>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Match Value</Label>
                  <Input
                    value={formData.match_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, match_value: e.target.value }))}
                    placeholder={formData.match_field === 'amount' ? '100.00' : 'e.g., uber, starbucks'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v, subcategory: '' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTION_CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Select value={formData.subcategory || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, subcategory: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory?.subcategories.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Test Rules Section */}
      {rules.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Test Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter transaction description to test..."
                className="flex-1"
              />
              <Button onClick={handleTestRules}>Test</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      {isLoading ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading rules...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Rules Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Create categorization rules to automatically organize your transactions.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Rule
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {rules.map(rule => (
            <Card key={rule.id} className={testResults[rule.id] === true ? 'ring-2 ring-green-500' : testResults[rule.id] === false && Object.keys(testResults).length > 0 ? 'opacity-50' : ''}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${rule.is_active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {testResults[rule.id] ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : testResults[rule.id] === false && Object.keys(testResults).length > 0 ? (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Filter className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">
                      If <span className="font-mono text-xs bg-muted px-1 rounded">{rule.match_field}</span>{' '}
                      <span className="text-primary">{rule.match_type.replace('_', ' ')}</span>{' '}
                      <span className="font-mono text-xs bg-muted px-1 rounded">{rule.match_value}</span>
                      {' → '}
                      <Badge variant="secondary">{rule.category}</Badge>
                      {rule.subcategory && <Badge variant="outline" className="ml-1">{rule.subcategory}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.is_active} />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
