'use client'
// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'


export const dynamic = 'force-dynamic';

;

/**
 * Business Automation Agent Dashboard
 *
 * Fully integrated with FreeFlow Kazi UI/UX system
 * - Email intelligence and automation
 * - Booking management
 * - Client follow-ups
 * - Invoice reminders
 * - Business analytics
 * - Approval workflows
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Send, FileText, CheckCircle, Clock, Settings, TrendingUp,
  AlertCircle, Zap, DollarSign, Calendar, Search, RefreshCw, Eye, ThumbsUp, ThumbsDown, MessageSquare, Bot,
  ChevronRight, Activity, Sparkles, BarChart3, Star,
  ArrowRight, Check, X, PlayCircle,
  Link as LinkIcon, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import logger from '@/lib/logger';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

// ============================================================================
// TYPES
// ============================================================================

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  analysis?: {
    intent: string;
    sentiment: string;
    priority: string;
    category: string;
    summary: string;
    requiresQuotation: boolean;
    requiresHumanReview: boolean;
  };
  hasResponse?: boolean;
  hasQuotation?: boolean;
  status: string;
}

interface ApprovalWorkflow {
  id: string;
  type: string;
  status: string;
  priority: string;
  createdAt: Date;
  item?: any;
}

interface Statistics {
  totalEmailsProcessed: number;
  responsesGenerated: number;
  quotationsGenerated: number;
  approvalsPending: number;
  approvalsCompleted: number;
  avgResponseTime: number;
  bookingsCreated?: number;
  clientFollowUps?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - EmailAgent Context
// ============================================================================

const emailAgentAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const emailAgentCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const emailAgentPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const emailAgentActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function EmailAgentClient() {
  const { toast } = useToast();
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [approvals, setApprovals] = useState<ApprovalWorkflow[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalWorkflow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Agent configuration
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [autoRespond, setAutoRespond] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);

  // Setup status
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);

  // Dialog states for quick actions
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('email_template');
  const [newItemPriority, setNewItemPriority] = useState('medium');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [creatingItem, setCreatingItem] = useState(false);

  // Export form state
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportDateRange, setExportDateRange] = useState('last_30_days');
  const [exportIncludeAnalysis, setExportIncludeAnalysis] = useState(true);
  const [exportIncludeResponses, setExportIncludeResponses] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Quick settings state
  const [quickSettingsNotifications, setQuickSettingsNotifications] = useState(true);
  const [quickSettingsAutoAnalyze, setQuickSettingsAutoAnalyze] = useState(true);
  const [quickSettingsResponseDelay, setQuickSettingsResponseDelay] = useState('immediate');
  const [savingQuickSettings, setSavingQuickSettings] = useState(false);

  // Quick actions with dialog handlers
  const emailAgentQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewItemDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ];

  // Handler for creating new item
  const handleCreateNewItem = async () => {
    if (!newItemName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name for the item',
        variant: 'destructive',
      });
      return;
    }

    setCreatingItem(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Item Created',
        description: `Successfully created "${newItemName}" as ${newItemType.replace('_', ' ')}`,
      });

      // Reset form and close dialog
      setNewItemName('');
      setNewItemType('email_template');
      setNewItemPriority('medium');
      setNewItemDescription('');
      setShowNewItemDialog(false);

      // Refresh data
      loadDashboardData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreatingItem(false);
    }
  };

  // Handler for exporting data
  const handleExportData = async () => {
    setExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));

      const exportData = {
        format: exportFormat,
        dateRange: exportDateRange,
        includeAnalysis: exportIncludeAnalysis,
        includeResponses: exportIncludeResponses,
        emails: emails,
        statistics: statistics,
        exportedAt: new Date().toISOString(),
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-agent-export-${new Date().toISOString().split('T')[0]}.${exportFormat === 'json' ? 'json' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: `Data exported as ${exportFormat.toUpperCase()} file`,
      });

      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Unable to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Handler for saving quick settings
  const handleSaveQuickSettings = async () => {
    setSavingQuickSettings(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      toast({
        title: 'Settings Saved',
        description: 'Your quick settings have been updated',
      });

      setShowSettingsDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingQuickSettings(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
    loadSetupStatus();
    loadIntegrations();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStatistics(),
        loadEmails(),
        loadApprovals(),
      ]);
    } catch (error) {
      logger.error('Error loading dashboard data', { error });
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/email-agent?action=statistics');
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      logger.error('Error loading statistics', { error });
    }
  };

  const loadEmails = async () => {
    // Mock data for demonstration
    setEmails([
      {
        id: '1',
        from: 'john@example.com',
        subject: 'Need a quote for web development',
        body: 'Hi, I need a website for my business...',
        receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        analysis: {
          intent: 'quote_request',
          sentiment: 'positive',
          priority: 'high',
          category: 'Sales',
          summary: 'Client requesting web development quotation',
          requiresQuotation: true,
          requiresHumanReview: false,
        },
        hasResponse: true,
        hasQuotation: true,
        status: 'processed',
      },
      {
        id: '2',
        from: 'sarah@company.com',
        subject: 'Book a consultation',
        body: 'I would like to schedule a consultation for next week...',
        receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        analysis: {
          intent: 'inquiry',
          sentiment: 'neutral',
          priority: 'medium',
          category: 'Booking',
          summary: 'Client requesting consultation booking',
          requiresQuotation: false,
          requiresHumanReview: false,
        },
        hasResponse: true,
        status: 'processed',
      },
    ]);
  };

  const loadApprovals = async () => {
    try {
      const response = await fetch('/api/email-agent/approvals?status=pending');
      const data = await response.json();
      if (data.success) {
        setApprovals(data.data || []);
      }
    } catch (error) {
      logger.error('Error loading approvals', { error });
    }
  };

  const loadSetupStatus = async () => {
    try {
      const response = await fetch('/api/integrations/complete-setup');
      const data = await response.json();
      if (data.success) {
        setSetupCompleted(data.setupCompleted || false);
      }
    } catch (error) {
      logger.error('Error loading setup status', { error });
    }
  };

  const loadIntegrations = async () => {
    try {
      setIntegrationsLoading(true);
      const response = await fetch('/api/integrations/save');
      const data = await response.json();
      if (data.success) {
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      logger.error('Error loading integrations', { error });
    } finally {
      setIntegrationsLoading(false);
    }
  };

  const handleApproval = async (workflowId: string, action: 'approved' | 'rejected', comments?: string) => {
    try {
      const response = await fetch('/api/email-agent/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          approver: 'current-user',
          action,
          comments,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: action === 'approved' ? 'Approved' : 'Rejected',
          description: `Workflow has been ${action}`,
        });
        await loadApprovals();
        setSelectedApproval(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      logger.error('Error processing approval', { error });
      toast({
        title: 'Error',
        description: 'Failed to process approval',
        variant: 'destructive',
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: { variant: 'destructive' as const, icon: AlertCircle },
      high: { variant: 'warning' as const, icon: TrendingUp },
      medium: { variant: 'secondary' as const, icon: Activity },
      low: { variant: 'outline' as const, icon: CheckCircle },
    };
    const config = variants[priority as keyof typeof variants] || variants.medium;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {priority}
      </Badge>
    );
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || email.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={emailAgentAIInsights} />
          <PredictiveAnalytics predictions={emailAgentPredictions} />
          <CollaborationIndicator collaborators={emailAgentCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={emailAgentQuickActions} />
          <ActivityFeed activities={emailAgentActivities} />
        </div>
{/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Business Automation Agent
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered automation for your entire business
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={loadDashboardData}
              variant="outline"
              size="sm"
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Badge variant="success" className="gap-2 px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Agent Active
            </Badge>
          </div>
        </motion.div>

        {/* Setup Status Banner */}
        {!setupCompleted && !integrationsLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <AlertTitle className="text-lg font-semibold">Complete Your Setup</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-3">
                  <p>Connect your email and AI provider to start automating your business!</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.location.href = '/dashboard/email-agent/setup'}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <PlayCircle className="mr-2 w-4 h-4" />
                      Start Setup (5 minutes)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/dashboard/email-agent/integrations'}
                    >
                      <LinkIcon className="mr-2 w-4 h-4" />
                      View Integrations
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Integration Status Cards */}
        {setupCompleted && !integrationsLoading && integrations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {/* Email Integration */}
            {integrations.find(i => i.type === 'email') && (
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Email Connected</div>
                        <div className="text-sm text-muted-foreground">
                          {integrations.find(i => i.type === 'email')?.provider}
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Integration */}
            {integrations.find(i => i.type === 'ai') && (
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">AI Provider Active</div>
                        <div className="text-sm text-muted-foreground">
                          {integrations.find(i => i.type === 'ai')?.provider}
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => window.location.href = '/dashboard/email-agent/integrations'}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Manage Integrations</div>
                      <div className="text-sm text-muted-foreground">
                        {integrations.length} connected
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              title: 'Pending Approvals',
              value: approvals.filter(a => a.status === 'pending').length,
              icon: Clock,
              color: 'from-orange-500 to-red-500',
              trend: '+12%',
            },
            {
              title: 'Emails Processed',
              value: statistics?.totalEmailsProcessed || emails.length,
              icon: Mail,
              color: 'from-blue-500 to-cyan-500',
              trend: '+28%',
            },
            {
              title: 'Responses Sent',
              value: statistics?.responsesGenerated || 0,
              icon: Send,
              color: 'from-green-500 to-emerald-500',
              trend: '+45%',
            },
            {
              title: 'Quotations',
              value: statistics?.quotationsGenerated || 0,
              icon: DollarSign,
              color: 'from-purple-500 to-pink-500',
              trend: '+34%',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", stat.color)} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={cn("p-2 rounded-xl bg-gradient-to-br", stat.color)}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend} from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="w-4 h-4" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2 relative">
              <CheckCircle className="w-4 h-4" />
              Approvals
              {approvals.filter(a => a.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Last 24 hours of automation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {emails.slice(0, 5).map((email, index) => (
                    <motion.div
                      key={email.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                        <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{email.subject}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{email.from}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {email.analysis && getPriorityBadge(email.analysis.priority)}
                          {email.hasResponse && (
                            <Badge variant="success" className="text-xs">Response Generated</Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Automation efficiency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Response Rate', value: 98, color: 'bg-green-500' },
                    { label: 'Approval Rate', value: 92, color: 'bg-blue-500' },
                    { label: 'Client Satisfaction', value: 95, color: 'bg-purple-500' },
                    { label: 'Automation Success', value: 96, color: 'bg-indigo-500' },
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{metric.label}</span>
                        <span className="font-bold">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Process Emails', icon: Mail, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Generate Report', icon: FileText, color: 'from-purple-500 to-pink-500' },
                    { label: 'Review Approvals', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
                    { label: 'View Analytics', icon: BarChart3, color: 'from-orange-500 to-red-500' },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto flex-col gap-2 py-4 hover:shadow-lg transition-all"
                    >
                      <div className={cn("p-3 rounded-xl bg-gradient-to-br", action.color)}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email Inbox</CardTitle>
                    <CardDescription>AI-analyzed incoming messages</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredEmails.map((email, index) => (
                    <motion.div
                      key={email.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{email.subject}</h3>
                            {email.analysis && getPriorityBadge(email.analysis.priority)}
                          </div>
                          <p className="text-sm text-gray-600">{email.from}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {email.analysis && getSentimentIcon(email.analysis.sentiment)}
                          <span className="text-xs text-gray-500">
                            {new Date(email.receivedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {email.analysis && (
                        <p className="text-sm text-gray-700 mb-2">{email.analysis.summary}</p>
                      )}

                      <div className="flex items-center gap-2">
                        {email.hasResponse && (
                          <Badge variant="success" className="gap-1">
                            <Send className="w-3 h-3" />
                            Response Generated
                          </Badge>
                        )}
                        {email.hasQuotation && (
                          <Badge variant="default" className="gap-1">
                            <FileText className="w-3 h-3" />
                            Quotation Created
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Review and approve automated actions</CardDescription>
              </CardHeader>
              <CardContent>
                {approvals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">All caught up!</p>
                    <p className="text-gray-600 mt-2">No pending approvals at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvals.map((approval, index) => (
                      <motion.div
                        key={approval.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold capitalize">
                                {approval.type.replace('_', ' ')}
                              </h3>
                              {getPriorityBadge(approval.priority)}
                            </div>
                            <p className="text-sm text-gray-600">
                              Created {new Date(approval.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {approval.item && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-3 max-h-40 overflow-auto">
                            <pre className="text-xs">{JSON.stringify(approval.item, null, 2)}</pre>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleApproval(approval.id, 'approved')}
                            size="sm"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleApproval(approval.id, 'rejected')}
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => setSelectedApproval(approval)}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Alert>
              <Sparkles className="w-4 h-4" />
              <AlertTitle>Booking Automation Active</AlertTitle>
              <AlertDescription>
                The agent automatically handles booking requests from emails, finds available slots,
                and sends confirmations with reminders.
              </AlertDescription>
            </Alert>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Automated scheduling and management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 py-8">
                  No bookings yet. Booking automation is ready and waiting for requests!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { label: 'Time Saved', value: '25 hrs/week', icon: Clock, color: 'text-blue-600' },
                { label: 'Response Rate', value: '98%', icon: TrendingUp, color: 'text-green-600' },
                { label: 'Client Satisfaction', value: '4.8/5', icon: Star, color: 'text-yellow-600' },
              ].map((stat) => (
                <Card key={stat.label} className="shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{stat.value}</span>
                      <stat.icon className={cn("w-8 h-8", stat.color)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>Customize automation behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Agent</Label>
                    <p className="text-sm text-gray-600">Activate business automation</p>
                  </div>
                  <Switch checked={agentEnabled} onCheckedChange={setAgentEnabled} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-respond</Label>
                    <p className="text-sm text-gray-600">Send responses without approval</p>
                  </div>
                  <Switch checked={autoRespond} onCheckedChange={setAutoRespond} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Approval</Label>
                    <p className="text-sm text-gray-600">Review before sending</p>
                  </div>
                  <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
                </div>

                <Separator />

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>Integration Required</AlertTitle>
                  <AlertDescription>
                    To enable full functionality, configure your email service, calendar, and payment integrations
                    in the environment variables. See documentation for details.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Details Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject}</DialogTitle>
            <DialogDescription>From: {selectedEmail?.from}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEmail?.analysis && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Intent</Label>
                  <p className="text-sm">{selectedEmail.analysis.intent}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  {getPriorityBadge(selectedEmail.analysis.priority)}
                </div>
                <div>
                  <Label>Sentiment</Label>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(selectedEmail.analysis.sentiment)}
                    <span className="text-sm">{selectedEmail.analysis.sentiment}</span>
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-sm">{selectedEmail.analysis.category}</p>
                </div>
              </div>
            )}
            <Separator />
            <div>
              <Label>Message</Label>
              <p className="text-sm mt-2">{selectedEmail?.body}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEmail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Create New Email Agent Item
            </DialogTitle>
            <DialogDescription>
              Create a new template, automation rule, or response pattern for your email agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="Enter item name..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-type">Item Type</Label>
              <Select value={newItemType} onValueChange={setNewItemType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email_template">Email Template</SelectItem>
                  <SelectItem value="response_pattern">Response Pattern</SelectItem>
                  <SelectItem value="automation_rule">Automation Rule</SelectItem>
                  <SelectItem value="filter_rule">Filter Rule</SelectItem>
                  <SelectItem value="quotation_template">Quotation Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-priority">Priority</Label>
              <Select value={newItemPriority} onValueChange={setNewItemPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description">Description (Optional)</Label>
              <Input
                id="item-description"
                placeholder="Brief description of this item..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)} disabled={creatingItem}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewItem} disabled={creatingItem} className="gap-2">
              {creatingItem ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Export Email Agent Data
            </DialogTitle>
            <DialogDescription>
              Export your email data, analytics, and automation history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="json">JSON (Developer)</SelectItem>
                  <SelectItem value="pdf">PDF (Report)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-range">Date Range</Label>
              <Select value={exportDateRange} onValueChange={setExportDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Include in Export</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Analysis Data</span>
                <Switch
                  checked={exportIncludeAnalysis}
                  onCheckedChange={setExportIncludeAnalysis}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Generated Responses</span>
                <Switch
                  checked={exportIncludeResponses}
                  onCheckedChange={setExportIncludeResponses}
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                Export includes {emails.length} emails and {statistics?.totalEmailsProcessed || 0} processed records.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={exporting}>
              Cancel
            </Button>
            <Button onClick={handleExportData} disabled={exporting} className="gap-2">
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Export Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Quick Settings
            </DialogTitle>
            <DialogDescription>
              Quickly adjust common email agent settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-gray-500">Get notified when emails are processed</p>
              </div>
              <Switch
                checked={quickSettingsNotifications}
                onCheckedChange={setQuickSettingsNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Analyze Emails</Label>
                <p className="text-xs text-gray-500">Automatically analyze incoming emails</p>
              </div>
              <Switch
                checked={quickSettingsAutoAnalyze}
                onCheckedChange={setQuickSettingsAutoAnalyze}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="response-delay">Response Delay</Label>
              <Select value={quickSettingsResponseDelay} onValueChange={setQuickSettingsResponseDelay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="5_minutes">5 Minutes</SelectItem>
                  <SelectItem value="15_minutes">15 Minutes</SelectItem>
                  <SelectItem value="1_hour">1 Hour</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Time to wait before sending automated responses</p>
            </div>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-xs">
                For advanced settings, visit the full Settings tab or the Integrations page.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)} disabled={savingQuickSettings}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuickSettings} disabled={savingQuickSettings} className="gap-2">
              {savingQuickSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
