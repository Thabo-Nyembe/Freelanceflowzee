'use client';

/**
 * Integration Step Components
 *
 * Beautiful, user-friendly components for each integration type
 * Makes connecting external services as easy as possible
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Brain,
  Eye, EyeOff, ExternalLink, PlayCircle, CheckCircle,
  Info, Loader2, HelpCircle, Sparkles, Shield,
  Zap, Clock, DollarSign, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/enhanced-badge';
import { Input } from '@/components/ui/enhanced-input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// ============================================================================
// EMAIL INTEGRATION COMPONENT
// ============================================================================

export function EmailIntegrationStep({ onComplete, onBack }: any) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<'gmail' | 'outlook' | 'resend' | 'sendgrid'>('gmail');
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    fromEmail: '',
    fromName: '',
  });

  const emailProviders = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Use your Gmail account',
      icon: Mail,
      method: 'oauth',
      recommended: true,
      pros: ['Easiest setup', 'Most secure', 'Auto-sync'],
      setup: '1 click',
      cost: 'Free',
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'Microsoft 365 / Outlook.com',
      icon: Mail,
      method: 'oauth',
      recommended: true,
      pros: ['Easy setup', 'Secure', 'Works with M365'],
      setup: '1 click',
      cost: 'Free',
    },
    {
      id: 'resend',
      name: 'Resend',
      description: 'Modern email API',
      icon: Zap,
      method: 'api',
      recommended: false,
      pros: ['Simple API', 'Great deliverability', 'Modern'],
      setup: '2 minutes',
      cost: 'Free tier: 3,000 emails/month',
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Enterprise email service',
      icon: Globe,
      method: 'api',
      recommended: false,
      pros: ['Enterprise-grade', 'Advanced analytics', 'High volume'],
      setup: '2 minutes',
      cost: 'Free tier: 100 emails/day',
    },
  ];

  const selectedProvider = emailProviders.find(p => p.id === provider);

  const handleOAuthConnect = (providerName: string) => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `/api/integrations/${providerName}/auth`,
      `${providerName}_oauth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for OAuth completion with timeout guard
    let attempts = 0;
    const maxAttempts = 120; // 60 seconds max (120 * 500ms)
    const checkPopup = setInterval(() => {
      attempts++;
      if (popup?.closed || attempts >= maxAttempts) {
        clearInterval(checkPopup);
        if (popup?.closed) {
          // Check if OAuth was successful
          const params = new URLSearchParams(window.location.search);
          if (params.get(providerName) === 'success') {
            toast({
              title: 'Connected Successfully!',
              description: `Your ${providerName} account is now connected.`,
            });
            setTimeout(onComplete, 1500);
          }
        }
      }
    }, 500);
  };

  const handleTestConnection = async () => {
    if (!config.apiKey || !config.fromEmail) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both API key and from email.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          config: { provider, ...config },
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Connection Successful!',
          description: 'Test email sent. Check your inbox.',
        });

        // Save configuration
        await fetch('/api/integrations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'email',
            config: { provider, ...config },
          }),
        });

        setTimeout(onComplete, 1500);
      } else {
        throw new Error(result.error || 'Connection test failed');
      }
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'URL copied to clipboard' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold mb-2">Connect Your Email</h2>
        <p className="text-muted-foreground">
          Choose how you want to send and receive emails
        </p>
      </div>

      {/* Provider Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {emailProviders.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id as any)}
            className={cn(
              'relative p-6 border-2 rounded-xl text-left transition-all hover:border-blue-500 hover:shadow-lg',
              provider === p.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg'
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <p.icon className="w-6 h-6 text-blue-500" />
              </div>
              {provider === p.id && (
                <CheckCircle className="w-6 h-6 text-blue-500" />
              )}
            </div>

            <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{p.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {p.recommended && (
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {p.setup}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              {p.pros.map((pro, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {pro}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3 inline mr-1" />
              {p.cost}
            </div>
          </button>
        ))}
      </div>

      <Separator />

      {/* Provider-Specific Configuration */}
      {selectedProvider?.method === 'oauth' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Secure OAuth Connection
            </CardTitle>
            <CardDescription>
              One-click secure authentication. No passwords stored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription className="space-y-2">
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Click the button below</li>
                  <li>Sign in to {selectedProvider.name}</li>
                  <li>Grant email access permissions</li>
                  <li>You'll be redirected back automatically</li>
                </ol>
              </AlertDescription>
            </Alert>

            <Button
              size="lg"
              className="w-full"
              onClick={() => handleOAuthConnect(provider)}
              disabled={loading}
            >
              <Mail className="mr-2 w-5 h-5" />
              Connect {selectedProvider.name} Account
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">Secure & Private</div>
                  <div>We never see your password. Uses industry-standard OAuth 2.0.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Get your API key from {selectedProvider?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Get Your API Key</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  {provider === 'resend' && (
                    <>
                      <div>1. Sign up at <a href="https://resend.com" target="_blank" className="underline">resend.com</a></div>
                      <div>2. Go to <a href="https://resend.com/api-keys" target="_blank" className="underline">API Keys</a></div>
                      <div>3. Create a new API key</div>
                      <div>4. Copy and paste it below</div>
                    </>
                  )}
                  {provider === 'sendgrid' && (
                    <>
                      <div>1. Sign up at <a href="https://sendgrid.com" target="_blank" className="underline">sendgrid.com</a></div>
                      <div>2. Go to Settings → <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" className="underline">API Keys</a></div>
                      <div>3. Create an API key with "Full Access"</div>
                      <div>4. Copy and paste it below</div>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key *</Label>
                <div className="flex gap-2">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    placeholder={provider === 'resend' ? 're_...' : 'SG....'}
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is encrypted before storage
                </p>
              </div>

              <div className="space-y-2">
                <Label>From Email Address *</Label>
                <Input
                  type="email"
                  placeholder="hello@yourdomain.com"
                  value={config.fromEmail}
                  onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  The email address that will send automated messages
                </p>
              </div>

              <div className="space-y-2">
                <Label>From Name (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Your Business Name"
                  value={config.fromName}
                  onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleTestConnection}
              disabled={loading || !config.apiKey || !config.fromEmail}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Test Connection & Continue
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="space-y-2 text-sm">
              <div className="font-medium">Need help?</div>
              <div className="text-muted-foreground">
                <div>• <strong>Gmail/Outlook:</strong> Just click connect - it's that easy!</div>
                <div>• <strong>Resend:</strong> Best for developers, generous free tier</div>
                <div>• <strong>SendGrid:</strong> Enterprise users, advanced features</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// AI PROVIDER INTEGRATION COMPONENT
// ============================================================================

export function AIProviderStep({ onComplete, onBack }: any) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'both'>('openai');
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState({ openai: false, anthropic: false });
  const [config, setConfig] = useState({
    openaiKey: '',
    anthropicKey: '',
    model: 'gpt-4',
  });

  const aiProviders = [
    {
      id: 'openai',
      name: 'OpenAI',
      fullName: 'OpenAI GPT-4',
      description: 'Industry-leading AI model',
      icon: Brain,
      recommended: true,
      models: ['GPT-4 Turbo', 'GPT-4', 'GPT-3.5 Turbo'],
      pros: ['Best quality', 'Fast responses', 'Proven reliability'],
      cost: '$0.01 - $0.10 per email',
      setup: '2 minutes',
      color: 'green',
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      fullName: 'Anthropic Claude',
      description: 'Advanced reasoning AI',
      icon: Sparkles,
      recommended: false,
      models: ['Claude 3 Opus', 'Claude 3 Sonnet'],
      pros: ['Excellent reasoning', 'Long context', 'Very accurate'],
      cost: '$0.01 - $0.15 per email',
      setup: '2 minutes',
      color: 'purple',
    },
    {
      id: 'both',
      name: 'Both',
      fullName: 'OpenAI + Anthropic',
      description: 'Use both for redundancy',
      icon: Zap,
      recommended: false,
      models: ['All models available'],
      pros: ['Automatic fallback', 'Compare outputs', 'Maximum uptime'],
      cost: 'Variable based on usage',
      setup: '3 minutes',
      color: 'blue',
    },
  ];

  const selectedProvider = aiProviders.find(p => p.id === provider);

  const handleTestConnection = async () => {
    const needsOpenAI = provider === 'openai' || provider === 'both';
    const needsAnthropic = provider === 'anthropic' || provider === 'both';

    if (needsOpenAI && !config.openaiKey) {
      toast({
        title: 'OpenAI API Key Required',
        description: 'Please enter your OpenAI API key.',
        variant: 'destructive',
      });
      return;
    }

    if (needsAnthropic && !config.anthropicKey) {
      toast({
        title: 'Anthropic API Key Required',
        description: 'Please enter your Anthropic API key.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ai',
          config: {
            provider,
            apiKey: provider === 'anthropic' ? config.anthropicKey : config.openaiKey,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'AI Connection Successful!',
          description: `${selectedProvider?.name} is working perfectly.`,
        });

        // Save configuration
        await fetch('/api/integrations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ai',
            config: { provider, ...config },
          }),
        });

        setTimeout(onComplete, 1500);
      } else {
        throw new Error(result.error || 'Connection test failed');
      }
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold mb-2">Connect AI Provider</h2>
        <p className="text-muted-foreground">
          Choose your AI engine for intelligent automation
        </p>
      </div>

      {/* Provider Selection */}
      <div className="grid md:grid-cols-3 gap-4">
        {aiProviders.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id as any)}
            className={cn(
              'relative p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg',
              provider === p.id
                ? `border-${p.color}-500 bg-${p.color}-50 dark:bg-${p.color}-950 shadow-lg`
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg bg-${p.color}-500/10 flex items-center justify-center`}>
                <p.icon className={`w-6 h-6 text-${p.color}-500`} />
              </div>
              {provider === p.id && (
                <CheckCircle className={`w-6 h-6 text-${p.color}-500`} />
              )}
            </div>

            <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{p.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {p.recommended && (
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {p.setup}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground mb-3">
              {p.pros.map((pro, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {pro}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3 inline mr-1" />
              {p.cost}
            </div>
          </button>
        ))}
      </div>

      <Separator />

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Your API key is encrypted and stored securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(provider === 'openai' || provider === 'both') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">OpenAI Setup</h3>
                <Badge>Required</Badge>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Get Your OpenAI API Key</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    <div>1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">platform.openai.com/api-keys</a></div>
                    <div>2. Sign in or create an account</div>
                    <div>3. Click "Create new secret key"</div>
                    <div>4. Copy the key (starts with sk-)</div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>OpenAI API Key *</Label>
                <div className="flex gap-2">
                  <Input
                    type={showKeys.openai ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={config.openaiKey}
                    onChange={(e) => setConfig({ ...config, openaiKey: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                  >
                    {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(provider === 'anthropic' || provider === 'both') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Anthropic Setup</h3>
                {provider === 'both' && <Badge variant="outline">Optional</Badge>}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Get Your Anthropic API Key</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    <div>1. Visit <a href="https://console.anthropic.com/account/keys" target="_blank" className="underline">console.anthropic.com</a></div>
                    <div>2. Sign in or create an account</div>
                    <div>3. Go to Account → API Keys</div>
                    <div>4. Create a new key and copy it</div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Anthropic API Key {provider === 'anthropic' && '*'}</Label>
                <div className="flex gap-2">
                  <Input
                    type={showKeys.anthropic ? 'text' : 'password'}
                    placeholder="sk-ant-..."
                    value={config.anthropicKey}
                    onChange={(e) => setConfig({ ...config, anthropicKey: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys({ ...showKeys, anthropic: !showKeys.anthropic })}
                  >
                    {showKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleTestConnection}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Testing AI Connection...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 w-5 h-5" />
                Test Connection & Continue
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Cost Estimate */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="space-y-2 text-sm">
              <div className="font-medium">Estimated Costs</div>
              <div className="text-muted-foreground space-y-1">
                <div>• <strong>Low volume</strong> (50 emails/day): $1.50 - $5/month</div>
                <div>• <strong>Medium volume</strong> (200 emails/day): $6 - $20/month</div>
                <div>• <strong>High volume</strong> (1000 emails/day): $30 - $100/month</div>
              </div>
              <div className="text-xs pt-2 border-t">
                Actual costs depend on email length and complexity. You only pay for what you use.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
