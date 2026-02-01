import React from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Calendar,
  MessageSquare,
  FileText,
  Video,
  Clock,
  DollarSign,
  Users,
  Star,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: unknown;
  enabled: boolean;
  status: 'active' | 'pending' | 'error';
  lastSync?: string;
}

export const FreelancerIntegrationsComponent = () => {
  const supabase = useSupabaseClient();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [integrations, setIntegrations] = React.useState<Integration[]>([
    {
      id: 'calendar',
      name: 'Calendar Integration',
      description: 'Sync project deadlines and client meetings with your calendar',
      icon: Calendar,
      enabled: false,
      status: 'pending',
    },
    {
      id: 'communication',
      name: 'Client Communication Hub',
      description: 'Centralize all client communications and feedback',
      icon: MessageSquare,
      enabled: true,
      status: 'active',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'documents',
      name: 'Document Management',
      description: 'Integrate project documents and deliverables',
      icon: FileText,
      enabled: true,
      status: 'active',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'portfolio',
      name: 'Portfolio Showcase',
      description: 'Automatically update portfolio with completed projects',
      icon: Video,
      enabled: true,
      status: 'active',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'timeTracking',
      name: 'Time Tracking',
      description: 'Track time spent on projects and tasks',
      icon: Clock,
      enabled: false,
      status: 'pending',
    },
    {
      id: 'payments',
      name: 'Payment Processing',
      description: 'Handle invoices and payments automatically',
      icon: DollarSign,
      enabled: true,
      status: 'active',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'clientPortal',
      name: 'Client Portal',
      description: 'Give clients access to project updates and deliverables',
      icon: Users,
      enabled: true,
      status: 'active',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'reviews',
      name: 'Review Management',
      description: 'Collect and showcase client reviews and testimonials',
      icon: Star,
      enabled: true,
      status: 'active',
      lastSync: new Date().toISOString(),
    },
  ]);

  const toggleIntegration = async (integrationId: string) => {
    const updatedIntegrations = integrations.map(integration =>
      integration.id === integrationId
        ? {
            ...integration,
            enabled: !integration.enabled,
            status: !integration.enabled ? 'active' : 'pending',
            lastSync: !integration.enabled ? new Date().toISOString() : undefined,
          }
        : integration
    );
    setIntegrations(updatedIntegrations);

    // Update user preferences in database
    const { error } = await supabase
      .from('user_profiles')
      .update({
        integration_preferences: {
          [integrationId]: !integrations.find(i => i.id === integrationId)?.enabled,
        },
      })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error('Error updating integration preferences:', error);
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    const variants = {
      active: 'success',
      pending: 'warning',
      error: 'destructive',
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    toast.loading('Syncing all integrations...', { id: 'sync-all' });

    // Simulate syncing each enabled integration
    const enabledIntegrations = integrations.filter(i => i.enabled);
    let synced = 0;

    for (const integration of enabledIntegrations) {
      await new Promise(resolve => setTimeout(resolve, 500));
      synced++;
      toast.loading(`Syncing ${integration.name}... (${synced}/${enabledIntegrations.length})`, { id: 'sync-all' });
    }

    // Update all enabled integrations with new sync time
    setIntegrations(prev => prev.map(integration =>
      integration.enabled
        ? { ...integration, lastSync: new Date().toISOString(), status: 'active' as const }
        : integration
    ));

    toast.success('All integrations synced', {
      id: 'sync-all',
      description: `Successfully synced ${enabledIntegrations.length} integrations`
    });

    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Integrations</h2>
        <Button variant="outline" onClick={handleSyncAll} disabled={isSyncing}>
          {isSyncing ? 'Syncing...' : 'Sync All'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <integration.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                  {integration.lastSync && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last synced: {new Date(integration.lastSync).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {getStatusBadge(integration.status)}
                <Switch
                  checked={integration.enabled}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Integration Activity</h3>
        <div className="space-y-4">
          {integrations
            .filter((i) => i.enabled)
            .map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center space-x-2">
                  <integration.icon className="h-4 w-4 text-gray-500" />
                  <span>{integration.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {integration.lastSync
                    ? `Last activity: ${new Date(integration.lastSync).toLocaleDateString()}`
                    : 'No recent activity'}
                </span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}; 