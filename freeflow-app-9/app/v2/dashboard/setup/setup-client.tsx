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
;

/**
 * Business Automation Agent - Easy Setup Wizard
 *
 * Intuitive step-by-step setup for integrating:
 * - Email accounts (Gmail, Outlook, IMAP)
 * - Calendar (Google Calendar, Outlook)
 * - Payment processing (Stripe)
 * - SMS/WhatsApp (Twilio)
 * - CRM (HubSpot, Salesforce)
 * - AI providers (OpenAI, Anthropic)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Check, ChevronRight, ChevronLeft, Loader2, AlertCircle,
  CheckCircle, XCircle, Eye, EyeOff, ExternalLink,
  Zap, Shield, Clock, TrendingUp, Settings,
  Info, Sparkles, ArrowRight, PlayCircle
} from 'lucide-react';
import logger from '@/lib/logger';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

// ============================================================================
// TYPES
// ============================================================================

type SetupStep = 'welcome' | 'email' | 'ai' | 'calendar' | 'payments' | 'sms' | 'crm' | 'review' | 'complete';

interface Integration {
  id: string;
  name: string;
  type: 'email' | 'ai' | 'calendar' | 'payment' | 'sms' | 'crm';
  provider: string;
  status: 'not_configured' | 'configuring' | 'testing' | 'connected' | 'error';
  required: boolean;
  config?: any;
  error?: string;
}

interface SetupConfig {
  email: {
    provider: 'gmail' | 'outlook' | 'imap' | 'resend' | 'sendgrid';
    credentials?: any;
  };
  ai: {
    provider: 'openai' | 'anthropic' | 'both';
    apiKey?: string;
    model?: string;
  };
  calendar?: {
    provider: 'google' | 'outlook' | 'none';
    credentials?: any;
  };
  payments?: {
    provider: 'stripe' | 'none';
    credentials?: any;
  };
  sms?: {
    provider: 'twilio' | 'none';
    credentials?: any;
  };
  crm?: {
    provider: 'hubspot' | 'salesforce' | 'none';
    credentials?: any;
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Setup Context
// ============================================================================

const setupAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const setupCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const setupPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const setupActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const setupQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => console.log('New') },
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => console.log('Export') },
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => console.log('Settings') },
]

export default function SetupClient() {
  const { toast } = useToast();
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [config, setConfig] = useState<SetupConfig>({
    email: { provider: 'gmail' },
    ai: { provider: 'openai' },
  });
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'email', name: 'Email', type: 'email', provider: 'Gmail', status: 'not_configured', required: true },
    { id: 'ai', name: 'AI Provider', type: 'ai', provider: 'OpenAI', status: 'not_configured', required: true },
    { id: 'calendar', name: 'Calendar', type: 'calendar', provider: 'Google Calendar', status: 'not_configured', required: false },
    { id: 'payment', name: 'Payments', type: 'payment', provider: 'Stripe', status: 'not_configured', required: false },
    { id: 'sms', name: 'SMS/WhatsApp', type: 'sms', provider: 'Twilio', status: 'not_configured', required: false },
    { id: 'crm', name: 'CRM', type: 'crm', provider: 'HubSpot', status: 'not_configured', required: false },
  ]);

  const steps: SetupStep[] = ['welcome', 'email', 'ai', 'calendar', 'payments', 'sms', 'crm', 'review', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
      logger.info('Setup wizard: moved to next step', { step: steps[nextIndex] });
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
      logger.info('Setup wizard: moved to previous step', { step: steps[prevIndex] });
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const testConnection = async (type: string) => {
    setLoading(true);
    logger.info('Testing integration connection', { type });

    try {
      // Update status to testing
      setIntegrations(prev => prev.map(int =>
        int.type === type ? { ...int, status: 'testing' } : int
      ));

      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, config: config[type as keyof SetupConfig] }),
      });

      const result = await response.json();

      if (result.success) {
        setIntegrations(prev => prev.map(int =>
          int.type === type ? { ...int, status: 'connected' } : int
        ));
        toast({
          title: 'Connection Successful',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} integration is working correctly.`,
        });
        logger.info('Integration test successful', { type });
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error: any) {
      setIntegrations(prev => prev.map(int =>
        int.type === type ? { ...int, status: 'error', error: error.message } : int
      ));
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
      logger.error('Integration test failed', { type, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async (type: string) => {
    setLoading(true);
    logger.info('Saving integration', { type });

    try {
      const response = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, config: config[type as keyof SetupConfig] }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Integration Saved',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} configuration has been saved.`,
        });
        logger.info('Integration saved successfully', { type });
        handleNext();
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
      logger.error('Integration save failed', { type, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = async () => {
    setLoading(true);
    logger.info('Finishing setup wizard');

    try {
      const response = await fetch('/api/integrations/complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, integrations }),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentStep('complete');
        toast({
          title: 'Setup Complete!',
          description: 'Your Business Automation Agent is ready to use.',
        });
        logger.info('Setup wizard completed successfully');
      } else {
        throw new Error(result.error || 'Setup completion failed');
      }
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message,
        variant: 'destructive',
      });
      logger.error('Setup completion failed', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard.',
    });
  };

  // ============================================================================
  // STEP COMPONENTS
  // ============================================================================

  const WelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Business Automation Agent
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Let's set up your AI-powered business assistant in just a few minutes.
          You'll be automating emails, bookings, and more in no time!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="border-2 hover:border-blue-500 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <CardTitle>Save 25+ Hours/Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automate email responses, scheduling, follow-ups, and more
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-500 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <CardTitle>Increase Revenue 30-50%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Instant responses, smarter follow-ups, zero missed opportunities
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-green-500 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <CardTitle>Enterprise Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              GDPR compliant, encrypted, with full audit trails
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>Setup Time: ~10 minutes</AlertTitle>
        <AlertDescription>
          We'll guide you through connecting your email, AI, and optional integrations.
          You can skip optional steps and add them later.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleNext} className="px-8">
          Get Started
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );

  const EmailSetupStep = () => {
    const [emailProvider, setEmailProvider] = useState<'gmail' | 'outlook' | 'imap' | 'resend' | 'sendgrid'>('gmail');
    const [emailConfig, setEmailConfig] = useState({
      apiKey: '',
      email: '',
      password: '',
      host: '',
      port: '',
    });

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">Connect Your Email</h2>
          <p className="text-muted-foreground">
            Choose how you want to send and receive emails
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Email Provider</CardTitle>
            <CardDescription>
              We recommend Gmail or Outlook for easiest setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { value: 'gmail', label: 'Gmail', recommended: true },
                { value: 'outlook', label: 'Outlook', recommended: true },
                { value: 'resend', label: 'Resend (API)', recommended: false },
                { value: 'sendgrid', label: 'SendGrid (API)', recommended: false },
              ].map((provider) => (
                <button
                  key={provider.value}
                  onClick={() => setEmailProvider(provider.value as any)}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all hover:border-blue-500',
                    emailProvider === provider.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{provider.label}</div>
                      {provider.recommended && (
                        <Badge variant="secondary" className="mt-1">Recommended</Badge>
                      )}
                    </div>
                    {emailProvider === provider.value && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Separator />

            {emailProvider === 'gmail' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Gmail OAuth Setup</AlertTitle>
                  <AlertDescription>
                    Click the button below to authenticate with Google. This is the most secure method.
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('/api/integrations/gmail/auth', '_blank')}
                >
                  <Mail className="mr-2 w-4 h-4" />
                  Connect Gmail Account
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold">What happens next:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>You'll be redirected to Google's secure login</li>
                    <li>Grant permissions for email access</li>
                    <li>You'll be redirected back automatically</li>
                  </ol>
                </div>
              </div>
            )}

            {emailProvider === 'outlook' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Microsoft OAuth Setup</AlertTitle>
                  <AlertDescription>
                    Connect your Microsoft/Outlook account securely with OAuth.
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('/api/integrations/outlook/auth', '_blank')}
                >
                  <Mail className="mr-2 w-4 h-4" />
                  Connect Outlook Account
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {emailProvider === 'resend' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Resend API Setup</AlertTitle>
                  <AlertDescription>
                    Get your API key from{' '}
                    <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                      resend.com/api-keys
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showPasswords['resend'] ? 'text' : 'password'}
                      placeholder="re_..."
                      value={emailConfig.apiKey}
                      onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPasswords({ ...showPasswords, resend: !showPasswords['resend'] })}
                    >
                      {showPasswords['resend'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    placeholder="hello@yourdomain.com"
                    value={emailConfig.email}
                    onChange={(e) => setEmailConfig({ ...emailConfig, email: e.target.value })}
                  />
                </div>

                <Button
                  onClick={() => testConnection('email')}
                  disabled={loading || !emailConfig.apiKey}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 w-4 h-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            )}

            {emailProvider === 'sendgrid' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>SendGrid API Setup</AlertTitle>
                  <AlertDescription>
                    Get your API key from{' '}
                    <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="underline">
                      SendGrid Settings
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showPasswords['sendgrid'] ? 'text' : 'password'}
                      placeholder="SG...."
                      value={emailConfig.apiKey}
                      onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPasswords({ ...showPasswords, sendgrid: !showPasswords['sendgrid'] })}
                    >
                      {showPasswords['sendgrid'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    placeholder="noreply@yourdomain.com"
                    value={emailConfig.email}
                    onChange={(e) => setEmailConfig({ ...emailConfig, email: e.target.value })}
                  />
                </div>

                <Button
                  onClick={() => testConnection('email')}
                  disabled={loading || !emailConfig.apiKey}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 w-4 h-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <Button onClick={() => saveIntegration('email')} disabled={loading}>
            Continue
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const AISetupStep = () => {
    const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic' | 'both'>('openai');
    const [apiKeys, setApiKeys] = useState({
      openai: '',
      anthropic: '',
    });

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">Connect AI Provider</h2>
          <p className="text-muted-foreground">
            Choose your AI provider for intelligent automation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select AI Provider</CardTitle>
            <CardDescription>
              OpenAI is recommended for most users. You can use both for redundancy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { value: 'openai', label: 'OpenAI GPT-4', recommended: true },
                { value: 'anthropic', label: 'Anthropic Claude', recommended: false },
                { value: 'both', label: 'Both (Redundancy)', recommended: false },
              ].map((provider) => (
                <button
                  key={provider.value}
                  onClick={() => setAiProvider(provider.value as any)}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all hover:border-purple-500',
                    aiProvider === provider.value ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-gray-200'
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold">{provider.label}</div>
                      {aiProvider === provider.value && (
                        <CheckCircle className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                    {provider.recommended && (
                      <Badge variant="secondary">Recommended</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Separator />

            {(aiProvider === 'openai' || aiProvider === 'both') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">OpenAI Configuration</h3>
                  <Badge>Required</Badge>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Get Your OpenAI API Key</AlertTitle>
                  <AlertDescription>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline flex items-center gap-1"
                    >
                      Visit OpenAI Platform
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showPasswords['openai'] ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPasswords({ ...showPasswords, openai: !showPasswords['openai'] })}
                    >
                      {showPasswords['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your API key is encrypted and stored securely
                  </p>
                </div>
              </div>
            )}

            {(aiProvider === 'anthropic' || aiProvider === 'both') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Anthropic Configuration</h3>
                  {aiProvider === 'both' && <Badge variant="outline">Optional</Badge>}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Get Your Anthropic API Key</AlertTitle>
                  <AlertDescription>
                    <a
                      href="https://console.anthropic.com/account/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline flex items-center gap-1"
                    >
                      Visit Anthropic Console
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Anthropic API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showPasswords['anthropic'] ? 'text' : 'password'}
                      placeholder="sk-ant-..."
                      value={apiKeys.anthropic}
                      onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPasswords({ ...showPasswords, anthropic: !showPasswords['anthropic'] })}
                    >
                      {showPasswords['anthropic'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => testConnection('ai')}
              disabled={loading || !apiKeys.openai}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 w-4 h-4" />
                  Test AI Connection
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <Button onClick={() => saveIntegration('ai')} disabled={loading || !apiKeys.openai}>
            Continue
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const ReviewStep = () => {
    const connectedIntegrations = integrations.filter(int => int.status === 'connected');
    const requiredComplete = integrations.filter(int => int.required).every(int => int.status === 'connected');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">Review Your Setup</h2>
          <p className="text-muted-foreground">
            Check your integrations before completing setup
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              {connectedIntegrations.length} of {integrations.length} integrations configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    integration.status === 'connected' ? 'bg-green-100 dark:bg-green-950' :
                    integration.status === 'error' ? 'bg-red-100 dark:bg-red-950' :
                    'bg-gray-100 dark:bg-gray-800'
                  )}>
                    {integration.status === 'connected' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : integration.status === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {integration.name}
                      {integration.required && <Badge variant="secondary">Required</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {integration.provider}
                    </div>
                  </div>
                </div>

                <div>
                  {integration.status === 'connected' ? (
                    <Badge className="bg-green-500">Connected</Badge>
                  ) : integration.status === 'error' ? (
                    <Badge variant="destructive">Error</Badge>
                  ) : (
                    <Badge variant="outline">Not Configured</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {!requiredComplete && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Required Integrations Missing</AlertTitle>
            <AlertDescription>
              Please configure all required integrations (Email and AI) before completing setup.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <Button onClick={finishSetup} disabled={loading || !requiredComplete}>
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Completing Setup...
              </>
            ) : (
              <>
                Complete Setup
                <Check className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  };

  const CompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
          <Check className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <div>
        <h1 className="text-4xl font-bold mb-4">Setup Complete!</h1>
        <p className="text-xl text-muted-foreground">
          Your Business Automation Agent is ready to transform your business
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-semibold">Go to Dashboard</div>
              <p className="text-sm text-muted-foreground">
                Start monitoring emails and managing automations
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-semibold">Configure Business Rules</div>
              <p className="text-sm text-muted-foreground">
                Set your business hours, pricing, and automation preferences
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-semibold">Test with Sample Data</div>
              <p className="text-sm text-muted-foreground">
                Try processing a test email to see the AI in action
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button size="lg" onClick={() => window.location.href = '/dashboard/email-agent'}>
          Go to Dashboard
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <Button size="lg" variant="outline" onClick={() => window.location.href = '/dashboard/email-agent/settings'}>
          <Settings className="mr-2 w-5 h-5" />
          Configure Settings
        </Button>
      </div>
    </motion.div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={setupAIInsights} />
          <PredictiveAnalytics predictions={setupPredictions} />
          <CollaborationIndicator collaborators={setupCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={setupQuickActions} />
          <ActivityFeed activities={setupActivities} />
        </div>
{/* Header */}
        {currentStep !== 'complete' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Setup Wizard</h1>
                <p className="text-muted-foreground">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>
              <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
            </div>

            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && <WelcomeStep key="welcome" />}
          {currentStep === 'email' && <EmailSetupStep key="email" />}
          {currentStep === 'ai' && <AISetupStep key="ai" />}
          {currentStep === 'review' && <ReviewStep key="review" />}
          {currentStep === 'complete' && <CompleteStep key="complete" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
