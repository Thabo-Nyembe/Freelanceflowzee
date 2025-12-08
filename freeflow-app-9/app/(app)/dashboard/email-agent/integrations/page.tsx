'use client';

/**
 * Integrations Management Dashboard
 *
 * Centralized place to view, edit, test, and manage all integrations
 * - View connection status
 * - Test connections
 * - Edit credentials
 * - View usage statistics
 * - Manage webhooks
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Brain, Calendar, CreditCard, MessageSquare, Users,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Settings,
  Eye, EyeOff, Edit, Trash2, PlayCircle, TrendingUp,
  DollarSign, Zap, Shield, Clock, Activity, BarChart3,
  Plus, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import logger from '@/lib/logger';

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

// ============================================================================
// TYPES
// ============================================================================

interface Integration {
  id: string;
  type: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  lastTested?: Date;
  lastTestResult?: any;
  errorMessage?: string;
  config: any;
}

interface UsageStats {
  provider: string;
  totalCalls: number;
  totalCost: number;
  today: number;
  thisMonth: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function IntegrationsManagement() {
  const { toast } = useToast();
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);

  // Confirmation Dialog State
  const [disconnectIntegration, setDisconnectIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    loadIntegrations();
    loadUsageStats();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/save');
      const data = await response.json();

      if (data.success) {
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      logger.error('Failed to load integrations', { error });
    } finally {
      setLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/integrations/usage');
      const data = await response.json();

      if (data.success) {
        setUsageStats(data.stats || []);
      }
    } catch (error) {
      logger.error('Failed to load usage stats', { error });
    }
  };

  const testIntegration = async (integration: Integration) => {
    setTestingId(integration.id);
    logger.info('Testing integration', { type: integration.type });

    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: integration.type,
          config: integration.config,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Connection Successful',
          description: `${integration.provider} is working correctly.`,
        });

        // Update integration status
        setIntegrations(prev => prev.map(int =>
          int.id === integration.id
            ? { ...int, status: 'active', lastTested: new Date(), lastTestResult: result }
            : int
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });

      setIntegrations(prev => prev.map(int =>
        int.id === integration.id
          ? { ...int, status: 'error', errorMessage: error.message }
          : int
      ));
    } finally {
      setTestingId(null);
    }
  };

  const deleteIntegration = (integration: Integration) => {
    setDisconnectIntegration(integration);
  };

  const handleConfirmDisconnect = async () => {
    if (!disconnectIntegration) return;

    try {
      const response = await fetch(`/api/integrations/save?type=${disconnectIntegration.type}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Integration Removed',
          description: `${disconnectIntegration.provider} has been disconnected.`,
        });

        setIntegrations(prev => prev.filter(int => int.id !== disconnectIntegration.id));
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Remove',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDisconnectIntegration(null);
    }
  };

  const getIntegrationIcon = (type: string) => {
    const icons: any = {
      email: Mail,
      ai: Brain,
      calendar: Calendar,
      payment: CreditCard,
      sms: MessageSquare,
      crm: Users,
    };
    return icons[type] || Settings;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'green',
      inactive: 'gray',
      error: 'red',
    };
    return colors[status] || 'gray';
  };

  const integrationsByType = integrations.reduce((acc: any, int) => {
    if (!acc[int.type]) acc[int.type] = [];
    acc[int.type].push(int);
    return acc;
  }, {});

  const totalMonthlySpend = usageStats.reduce((sum, stat) => sum + stat.totalCost, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Manage your connected services and API usage
          </p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/email-agent/setup'}>
          <Plus className="mr-2 w-4 h-4" />
          Add Integration
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Integrations</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Spend</p>
                <p className="text-2xl font-bold">${totalMonthlySpend.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-2xl font-bold">
                  {integrations.length > 0 ? Math.round((integrations.filter(i => i.status === 'active').length / integrations.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({integrations.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({integrations.filter(i => i.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="usage">Usage & Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(integrationsByType).map(([type, ints]: any) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {React.createElement(getIntegrationIcon(type), { className: 'w-5 h-5' })}
                  {type}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ints.map((integration: Integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        integration.status === 'active' ? 'bg-green-100 dark:bg-green-950' :
                        integration.status === 'error' ? 'bg-red-100 dark:bg-red-950' :
                        'bg-gray-100 dark:bg-gray-800'
                      )}>
                        {integration.status === 'active' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : integration.status === 'error' ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold">{integration.provider}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {integration.lastTested && (
                            <span>Last tested: {new Date(integration.lastTested).toLocaleDateString()}</span>
                          )}
                          {integration.errorMessage && (
                            <span className="text-red-500">{integration.errorMessage}</span>
                          )}
                        </div>
                      </div>

                      <Badge className={cn(
                        integration.status === 'active' ? 'bg-green-500' :
                        integration.status === 'error' ? 'bg-red-500' :
                        'bg-gray-500'
                      )}>
                        {integration.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testIntegration(integration)}
                        disabled={testingId === integration.id}
                      >
                        {testingId === integration.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteIntegration(integration)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {integrations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Integrations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your first integration to get started
                </p>
                <Button onClick={() => window.location.href = '/dashboard/email-agent/setup'}>
                  <Plus className="mr-2 w-4 h-4" />
                  Add Integration
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {integrations.filter(i => i.status === 'active').map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{integration.provider}</CardTitle>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{integration.type}</span>
                  </div>
                  {integration.lastTested && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Tested:</span>
                      <span>{new Date(integration.lastTested).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage & Costs</CardTitle>
              <CardDescription>Track your spending across all integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.map((stat) => (
                  <div key={stat.provider} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{stat.provider}</div>
                      <div className="text-lg font-bold">${stat.totalCost.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Calls</div>
                        <div className="font-medium">{stat.totalCalls.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Today</div>
                        <div className="font-medium">{stat.today.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">This Month</div>
                        <div className="font-medium">{stat.thisMonth.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {usageStats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No usage data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selectedIntegration?.provider}</DialogTitle>
            <DialogDescription>
              Update your integration settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Encrypted Storage</AlertTitle>
              <AlertDescription>
                All credentials are encrypted before storage
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground">
              To update credentials, please disconnect and reconnect this integration.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setEditDialogOpen(false);
              window.location.href = '/dashboard/email-agent/setup';
            }}>
              Reconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Integration Confirmation Dialog */}
      <AlertDialog open={!!disconnectIntegration} onOpenChange={() => setDisconnectIntegration(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Integration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect {disconnectIntegration?.provider}. You can reconnect it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDisconnect}
              className="bg-red-500 hover:bg-red-600"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
