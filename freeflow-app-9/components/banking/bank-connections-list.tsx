/**
 * Bank Connections List - FreeFlow A+++ Implementation
 * Display and manage linked bank accounts
 */

'use client';

import { useState } from 'react';
import {
  Building2,
  CreditCard,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  useBankConnections,
  BankConnection,
  formatBalance,
  getConnectionStatusColor,
  getAccountTypeIcon,
} from '@/lib/hooks/use-bank-connections';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface BankConnectionsListProps {
  onAddBank: () => void;
}

export function BankConnectionsList({ onAddBank }: BankConnectionsListProps) {
  const {
    connections,
    summary,
    isLoading,
    removeConnection,
    syncConnection,
    syncAll,
  } = useBankConnections();

  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());
  const [syncingConnection, setSyncingConnection] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedConnections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSync = async (connectionId: string) => {
    setSyncingConnection(connectionId);
    await syncConnection(connectionId);
    setSyncingConnection(null);
  };

  const handleSyncAll = async () => {
    setSyncingConnection('all');
    await syncAll();
    setSyncingConnection(null);
  };

  const handleDelete = async () => {
    if (connectionToDelete) {
      await removeConnection(connectionToDelete);
      setConnectionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusIcon = (status: BankConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'pending_expiration':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl">
              {formatBalance(summary.totalBalance)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Connected Accounts</CardDescription>
            <CardTitle className="text-2xl">
              {summary.activeConnections} of {summary.totalConnections}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Actions</CardDescription>
            <CardContent className="p-0 pt-2">
              <div className="flex gap-2">
                <Button onClick={onAddBank} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Bank
                </Button>
                <Button
                  onClick={handleSyncAll}
                  variant="outline"
                  size="sm"
                  disabled={syncingConnection === 'all'}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4 mr-1",
                    syncingConnection === 'all' && "animate-spin"
                  )} />
                  Sync All
                </Button>
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>

      {/* Connections List */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bank Accounts Connected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Connect your bank accounts to automatically import transactions and track your finances.
            </p>
            <Button onClick={onAddBank}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Your First Bank
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map(connection => (
            <Collapsible
              key={connection.id}
              open={expandedConnections.has(connection.id)}
              onOpenChange={() => toggleExpanded(connection.id)}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {connection.institution?.logo_url ? (
                        <img
                          src={connection.institution.logo_url}
                          alt={connection.institution_name}
                          className="h-10 w-10 rounded-lg object-contain"
                        />
                      ) : (
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: connection.institution?.primary_color || '#6366f1' }}
                        >
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {connection.institution_name}
                          {getStatusIcon(connection.status)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline" className={getConnectionStatusColor(connection.status)}>
                            {connection.status.replace('_', ' ')}
                          </Badge>
                          {connection.last_sync_at && (
                            <span className="text-xs">
                              Last synced {formatDistanceToNow(new Date(connection.last_sync_at))} ago
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedConnections.has(connection.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="ml-1">
                            {connection.accounts?.length || 0} accounts
                          </span>
                        </Button>
                      </CollapsibleTrigger>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleSync(connection.id)}
                            disabled={syncingConnection === connection.id}
                          >
                            <RefreshCw className={cn(
                              "h-4 w-4 mr-2",
                              syncingConnection === connection.id && "animate-spin"
                            )} />
                            Sync Now
                          </DropdownMenuItem>
                          {connection.institution?.website_url && (
                            <DropdownMenuItem asChild>
                              <a
                                href={connection.institution.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Visit Bank
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setConnectionToDelete(connection.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Connection
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {connection.error_message && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-lg mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Error:</span>
                          {connection.error_message}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {connection.accounts?.map(account => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getAccountTypeIcon(account.type)}</span>
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {account.type} {account.mask && `••••${account.mask}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatBalance(account.current_balance, account.currency)}
                            </p>
                            {account.available_balance !== null &&
                              account.available_balance !== account.current_balance && (
                                <p className="text-sm text-muted-foreground">
                                  Available: {formatBalance(account.available_balance, account.currency)}
                                </p>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm text-muted-foreground">
                      <span>{connection.transactions_synced_count || 0} transactions synced</span>
                      {connection.next_sync_at && (
                        <span>Next sync: {new Date(connection.next_sync_at).toLocaleString()}</span>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bank Connection</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the bank connection and stop syncing transactions.
              Your existing transaction history will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
