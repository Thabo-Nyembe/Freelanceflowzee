'use client';

/**
 * Optional Integration Components
 *
 * Calendar, Payments, SMS, and CRM integrations
 * All skippable, with clear value propositions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, CreditCard, MessageSquare, Users, Eye, EyeOff,
  ExternalLink, PlayCircle, CheckCircle, Info, Loader2, DollarSign, Zap, TrendingUp, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/enhanced-badge';
import { Input } from '@/components/ui/enhanced-input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// ============================================================================
// CALENDAR INTEGRATION COMPONENT
// ============================================================================

export function CalendarIntegrationStep({ onComplete, onSkip, onBack }: any) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<'google' | 'outlook' | 'none'>('google');

  const calendarProviders = [
    {
      id: 'google',
      name: 'Google Calendar',
      description: 'Sync with Google Calendar',
      icon: Calendar,
      features: ['Auto-detect availability', 'Two-way sync', 'Prevent double-bookings'],
      value: 'Save 5+ hours/week on scheduling',
    },
    {
      id: 'outlook',
      name: 'Outlook Calendar',
      description: 'Microsoft 365 Calendar',
      icon: Calendar,
      features: ['Microsoft 365 integration', 'Team calendars', 'Auto-scheduling'],
      value: 'Works with your existing M365',
    },
  ];

  const selectedProvider = calendarProviders.find(p => p.id === provider);

  const handleConnect = (providerName: string) => {
    const popup = window.open(
      `/api/integrations/${providerName}-calendar/auth`,
      `${providerName}_calendar`,
      'width=600,height=700'
    );

    // Timeout guard to prevent infinite polling
    let attempts = 0;
    const maxAttempts = 120; // 60 seconds max
    const checkPopup = setInterval(() => {
      attempts++;
      if (popup?.closed || attempts >= maxAttempts) {
        clearInterval(checkPopup);
        if (popup?.closed) {
          toast({ title: 'Calendar Connected!', description: `${providerName} Calendar is now synced.` });
          setTimeout(onComplete, 1500);
        }
      }
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Calendar Integration</h2>
          <p className="text-muted-foreground">Automatically detect availability and prevent scheduling conflicts</p>
        </div>
        <Badge variant="outline">Optional</Badge>
      </div>

      {/* Value Proposition */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-blue-500 mt-0.5" />
            <div>
              <div className="font-semibold mb-2">Why connect your calendar?</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• <strong>95% time saved</strong> on manual scheduling</div>
                <div>• <strong>Zero double-bookings</strong> - automatic conflict detection</div>
                <div>• <strong>Smart suggestions</strong> - AI finds best meeting times</div>
                <div>• <strong>Auto-reminders</strong> - sent 24h, 1h, and 15min before</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {calendarProviders.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id as any)}
            className={cn(
              'p-6 border-2 rounded-xl text-left transition-all hover:border-blue-500 hover:shadow-lg',
              provider === p.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <p.icon className="w-6 h-6 text-blue-500" />
              </div>
              {provider === p.id && <CheckCircle className="w-6 h-6 text-blue-500" />}
            </div>

            <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{p.description}</p>

            <div className="space-y-1 text-xs text-muted-foreground mb-3">
              {p.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t text-xs font-medium text-blue-600">
              <Zap className="w-3 h-3 inline mr-1" />
              {p.value}
            </div>
          </button>
        ))}
      </div>

      {/* Connect Button */}
      {provider !== 'none' && (
        <Card>
          <CardContent className="pt-6">
            <Button
              size="lg"
              className="w-full"
              onClick={() => handleConnect(provider)}
            >
              <Calendar className="mr-2 w-5 h-5" />
              Connect {selectedProvider?.name}
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="ghost" onClick={onSkip}>
          Skip for Now
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// PAYMENT INTEGRATION COMPONENT
// ============================================================================

export function PaymentIntegrationStep({ onComplete, onSkip, onBack }: any) {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    publishableKey: '',
  });

  const handleTestConnection = async () => {
    if (!config.apiKey) {
      toast({ title: 'API Key Required', description: 'Please enter your Stripe secret key.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'payment', config: { provider: 'stripe', ...config } }),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: 'Stripe Connected!', description: 'Payment processing is now enabled.' });

        await fetch('/api/integrations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'payment', config: { provider: 'stripe', ...config } }),
        });

        setTimeout(onComplete, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: 'Connection Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Payment Processing</h2>
          <p className="text-muted-foreground">Accept payments through automated quotations</p>
        </div>
        <Badge variant="outline">Optional</Badge>
      </div>

      {/* Value Proposition */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-6 h-6 text-green-500 mt-0.5" />
            <div>
              <div className="font-semibold mb-2">Why integrate payments?</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• <strong>50% faster payments</strong> with automatic payment links</div>
                <div>• <strong>Higher conversion</strong> - frictionless checkout</div>
                <div>• <strong>Auto-tracking</strong> - know payment status instantly</div>
                <div>• <strong>Professional invoices</strong> - branded, itemized quotes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Stripe Integration
          </CardTitle>
          <CardDescription>Industry-leading payment processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Get Your Stripe API Keys</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                <div>1. Visit <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="underline">dashboard.stripe.com/apikeys</a></div>
                <div>2. Copy your "Secret key" (starts with sk_)</div>
                <div>3. Optionally copy "Publishable key" for checkout</div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Secret Key *</Label>
            <div className="flex gap-2">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="kazi_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxx... or kazi_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxx..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Publishable Key (Optional)</Label>
            <Input
              type="text"
              placeholder="pk_live_... or pk_test_..."
              value={config.publishableKey}
              onChange={(e) => setConfig({ ...config, publishableKey: e.target.value })}
              className="font-mono text-sm"
            />
          </div>

          <Button size="lg" className="w-full" onClick={handleTestConnection} disabled={loading || !config.apiKey}>
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="ghost" onClick={onSkip}>Skip for Now</Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SMS/WHATSAPP INTEGRATION COMPONENT
// ============================================================================

export function SMSIntegrationStep({ onComplete, onSkip, onBack }: any) {
  const { toast } = useToast();
  const [showCreds, setShowCreds] = useState({ sid: false, token: false });
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
  });

  const handleTestConnection = async () => {
    if (!config.accountSid || !config.authToken) {
      toast({ title: 'Credentials Required', description: 'Please provide Account SID and Auth Token.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sms', config: { provider: 'twilio', ...config } }),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: 'Twilio Connected!', description: 'SMS and WhatsApp messaging enabled.' });

        await fetch('/api/integrations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'sms', config: { provider: 'twilio', ...config } }),
        });

        setTimeout(onComplete, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: 'Connection Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">SMS & WhatsApp</h2>
          <p className="text-muted-foreground">Send booking reminders and notifications via text</p>
        </div>
        <Badge variant="outline">Optional</Badge>
      </div>

      {/* Value Proposition */}
      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Phone className="w-6 h-6 text-purple-500 mt-0.5" />
            <div>
              <div className="font-semibold mb-2">Why add SMS/WhatsApp?</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• <strong>70% reduction in no-shows</strong> with text reminders</div>
                <div>• <strong>98% open rate</strong> vs 20% for email</div>
                <div>• <strong>Instant delivery</strong> - clients get alerts immediately</div>
                <div>• <strong>WhatsApp Business</strong> - reach clients worldwide</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Twilio Integration
          </CardTitle>
          <CardDescription>Reliable SMS and WhatsApp delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Get Your Twilio Credentials</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                <div>1. Sign up at <a href="https://www.twilio.com/try-twilio" target="_blank" className="underline">twilio.com</a></div>
                <div>2. Get a phone number ($1/month)</div>
                <div>3. Copy Account SID and Auth Token from dashboard</div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Account SID *</Label>
            <div className="flex gap-2">
              <Input
                type={showCreds.sid ? 'text' : 'password'}
                placeholder="AC..."
                value={config.accountSid}
                onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={() => setShowCreds({ ...showCreds, sid: !showCreds.sid })}>
                {showCreds.sid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Auth Token *</Label>
            <div className="flex gap-2">
              <Input
                type={showCreds.token ? 'text' : 'password'}
                placeholder="Your auth token"
                value={config.authToken}
                onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={() => setShowCreds({ ...showCreds, token: !showCreds.token })}>
                {showCreds.token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Twilio Phone Number (Optional)</Label>
            <Input
              type="text"
              placeholder="+1234567890"
              value={config.phoneNumber}
              onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
            />
          </div>

          <Button size="lg" className="w-full" onClick={handleTestConnection} disabled={loading}>
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="ghost" onClick={onSkip}>Skip for Now</Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// CRM INTEGRATION COMPONENT
// ============================================================================

export function CRMIntegrationStep({ onComplete, onSkip, onBack }: any) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<'hubspot' | 'salesforce'>('hubspot');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ apiKey: '' });

  const crmProviders = [
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Popular CRM for SMBs',
      icon: Users,
      method: 'api',
      features: ['Contact sync', 'Deal tracking', 'Activity logging'],
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Enterprise CRM platform',
      icon: Users,
      method: 'oauth',
      features: ['Lead management', 'Opportunity tracking', 'Custom objects'],
    },
  ];

  const selectedProvider = crmProviders.find(p => p.id === provider);

  const handleConnect = async () => {
    if (selectedProvider?.method === 'oauth') {
      window.open(`/api/integrations/${provider}/auth`, '_blank');
      setTimeout(onComplete, 2000);
    } else {
      if (!config.apiKey) {
        toast({ title: 'API Key Required', variant: 'destructive' });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/integrations/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'crm', config: { provider, ...config } }),
        });

        const result = await response.json();

        if (result.success) {
          toast({ title: `${selectedProvider?.name} Connected!` });
          await fetch('/api/integrations/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'crm', config: { provider, ...config } }),
          });
          setTimeout(onComplete, 1500);
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        toast({ title: 'Connection Failed', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">CRM Integration</h2>
          <p className="text-muted-foreground">Sync contacts and track deals automatically</p>
        </div>
        <Badge variant="outline">Optional</Badge>
      </div>

      {/* Value Proposition */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-orange-500 mt-0.5" />
            <div>
              <div className="font-semibold mb-2">Why integrate your CRM?</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• <strong>Auto-sync contacts</strong> - no manual data entry</div>
                <div>• <strong>Track deals</strong> - quotations become opportunities</div>
                <div>• <strong>Activity logging</strong> - every interaction recorded</div>
                <div>• <strong>Unified view</strong> - all client data in one place</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {crmProviders.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id as any)}
            className={cn(
              'p-6 border-2 rounded-xl text-left transition-all hover:border-orange-500',
              provider === p.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-200'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <p.icon className="w-6 h-6 text-orange-500" />
              </div>
              {provider === p.id && <CheckCircle className="w-6 h-6 text-orange-500" />}
            </div>

            <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{p.description}</p>

            <div className="space-y-1 text-xs text-muted-foreground">
              {p.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {feature}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Configuration */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {selectedProvider?.method === 'oauth' ? (
            <Button size="lg" className="w-full" onClick={handleConnect}>
              <Users className="mr-2 w-5 h-5" />
              Connect {selectedProvider.name}
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Get Your HubSpot API Key</AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    Visit <a href="https://app.hubspot.com/settings" target="_blank" className="underline">HubSpot Settings → Integrations → API Key</a>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>API Key *</Label>
                <div className="flex gap-2">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    placeholder="Your HubSpot API key"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ apiKey: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleConnect} disabled={loading}>
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
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="ghost" onClick={onSkip}>Skip for Now</Button>
      </div>
    </motion.div>
  );
}
