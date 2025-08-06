'use client';

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Clock, 
  Sparkles, 
  Star, 
  Crown, 
  Building, 
  Briefcase,
  DollarSign,
  Gauge,
  LineChart,
  BarChart,
  PieChart,
  UserPlus,
  AlertCircle,
  ArrowRight,
  Gift,
  Download,
  Rocket,
  Lock,
  Unlock,
  Award,
  FileText,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// ===== TYPE DEFINITIONS =====

export type SubscriptionTier = 'free' | 'pro' | 'enterprise' | 'custom';

export type BillingInterval = 'monthly' | 'annual';

export type FeatureAccess = 'full' | 'limited' | 'none';

export type FeatureCategory = 
  | 'ai'
  | 'collaboration'
  | 'analytics'
  | 'projects'
  | 'feedback'
  | 'storage'
  | 'support'
  | 'security'
  | 'integrations';

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  access: Record<SubscriptionTier, FeatureAccess>;
  limits?: Record<SubscriptionTier, number | null>;
  beta?: boolean;
  comingSoon?: boolean;
  icon?: React.ReactNode;
  usageMetric?: string;
}

export interface PricingPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[]; // IDs of included features
  limits: Record<string, number | null>; // Feature ID to limit mapping
  stripePriceId: {
    monthly: string;
    annual: string;
  };
  popular?: boolean;
  badge?: string;
  icon?: React.ReactNode;
}

export interface UserSubscription {
  id: string;
  tier: SubscriptionTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  interval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  features: Record<string, boolean | number>; // Feature ID to access mapping
}

export interface UsageMetrics {
  id: string;
  userId: string;
  featureId: string;
  count: number;
  lastUsed: Date;
  firstUsed: Date;
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  customers: {
    total: number;
    free: number;
    pro: number;
    enterprise: number;
  };
  churnRate: number;
  conversionRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  historicalData: {
    date: string;
    mrr: number;
    newSubscribers: number;
    churnedSubscribers: number;
  }[];
}

export interface EnterpriseLead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  employees: string;
  requirements: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed_won' | 'closed_lost';
  createdAt: Date;
  updatedAt: Date;
}

export interface RetentionOffer {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  durationMonths: number;
  eligibilityCriteria: {
    minimumMonthsSubscribed: number;
    mustBeCancelling: boolean;
    tier: SubscriptionTier[];
  };
  code: string;
  expiresAt: Date;
  active: boolean;
}

export interface PremiumFeaturesContextType {
  currentSubscription: UserSubscription | null;
  isLoading: boolean;
  hasFeatureAccess: (featureId: string) => boolean;
  getRemainingUsage: (featureId: string) => number | null;
  upgradeTier: (tier: SubscriptionTier, interval: BillingInterval) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
  updatePaymentMethod: () => Promise<boolean>;
  trackFeatureUsage: (featureId: string) => Promise<void>;
  features: Feature[];
  plans: PricingPlan[];
  openUpgradeDialog: (tier?: SubscriptionTier) => void;
  isFeatureLocked: (featureId: string) => boolean;
}

// ===== CONTEXT =====

const PremiumFeaturesContext = createContext<PremiumFeaturesContextType | null>(null);

export const usePremiumFeatures = () => {
  const context = useContext(PremiumFeaturesContext);
  if (!context) {
    throw new Error('usePremiumFeatures must be used within a PremiumFeaturesProvider');
  }
  return context;
};

// ===== DEFAULT DATA =====

const DEFAULT_FEATURES: Feature[] = [
  // AI Features
  {
    id: 'ai-gateway',
    name: 'AI Gateway',
    description: 'Access to the unified AI Gateway with multiple AI models',
    category: 'ai',
    access: {
      free: 'limited',
      pro: 'full',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 10,
      pro: 1000,
      enterprise: null,
      custom: null,
    },
    icon: <Zap className="h-5 w-5" />,
    usageMetric: 'ai_requests',
  },
  {
    id: 'video-intelligence',
    name: 'Video Intelligence',
    description: 'AI-powered video analysis and content extraction',
    category: 'ai',
    access: {
      free: 'none',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: 50,
      enterprise: null,
      custom: null,
    },
    icon: <FileText className="h-5 w-5" />,
    usageMetric: 'video_analysis',
  },
  {
    id: 'multimodal-ai',
    name: 'Multimodal AI',
    description: 'Work with text, images, and audio simultaneously',
    category: 'ai',
    access: {
      free: 'none',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: 100,
      enterprise: 1000,
      custom: null,
    },
    icon: <Sparkles className="h-5 w-5" />,
    usageMetric: 'multimodal_requests',
  },
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    description: 'ML-powered forecasting and business intelligence',
    category: 'ai',
    access: {
      free: 'none',
      pro: 'none',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: 0,
      enterprise: null,
      custom: null,
    },
    icon: <LineChart className="h-5 w-5" />,
    usageMetric: 'predictive_analysis',
  },
  
  // Collaboration Features
  {
    id: 'universal-feedback',
    name: 'Universal Feedback System',
    description: 'Click-anywhere commenting on any content type',
    category: 'feedback',
    access: {
      free: 'limited',
      pro: 'full',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 20,
      pro: null,
      enterprise: null,
      custom: null,
    },
    icon: <MessageSquare className="h-5 w-5" />,
    usageMetric: 'feedback_comments',
  },
  {
    id: 'realtime-collaboration',
    name: 'Real-time Collaboration',
    description: 'Live cursors, typing indicators, and presence awareness',
    category: 'collaboration',
    access: {
      free: 'limited',
      pro: 'full',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 3,
      pro: 10,
      enterprise: null,
      custom: null,
    },
    icon: <Users className="h-5 w-5" />,
    usageMetric: 'collaboration_sessions',
  },
  {
    id: 'team-members',
    name: 'Team Members',
    description: 'Add team members to your workspace',
    category: 'collaboration',
    access: {
      free: 'limited',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 3,
      pro: 10,
      enterprise: 100,
      custom: null,
    },
    icon: <UserPlus className="h-5 w-5" />,
    usageMetric: 'team_members',
  },
  
  // Projects Features
  {
    id: 'projects',
    name: 'Projects',
    description: 'Create and manage projects',
    category: 'projects',
    access: {
      free: 'limited',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 3,
      pro: 20,
      enterprise: null,
      custom: null,
    },
    icon: <Briefcase className="h-5 w-5" />,
    usageMetric: 'projects_created',
  },
  {
    id: 'advanced-project-analytics',
    name: 'Advanced Project Analytics',
    description: 'In-depth metrics and performance tracking',
    category: 'analytics',
    access: {
      free: 'none',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: null,
      enterprise: null,
      custom: null,
    },
    icon: <BarChart className="h-5 w-5" />,
    usageMetric: 'analytics_views',
  },
  
  // Storage Features
  {
    id: 'storage',
    name: 'Storage',
    description: 'Cloud storage for files and assets',
    category: 'storage',
    access: {
      free: 'limited',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 5, // 5GB
      pro: 100, // 100GB
      enterprise: 1000, // 1TB
      custom: null,
    },
    icon: <HardDrive className="h-5 w-5" />,
    usageMetric: 'storage_used_gb',
  },
  
  // Support Features
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: 'Fast-track support with dedicated response times',
    category: 'support',
    access: {
      free: 'none',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: null,
      enterprise: null,
      custom: null,
    },
    icon: <Headset className="h-5 w-5" />,
  },
  {
    id: 'dedicated-success-manager',
    name: 'Dedicated Success Manager',
    description: 'Personal account manager for your organization',
    category: 'support',
    access: {
      free: 'none',
      pro: 'none',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: 0,
      enterprise: null,
      custom: null,
    },
    icon: <UserCheck className="h-5 w-5" />,
  },
  
  // Security Features
  {
    id: 'sso',
    name: 'Single Sign-On (SSO)',
    description: 'Enterprise SSO with SAML and OIDC support',
    category: 'security',
    access: {
      free: 'none',
      pro: 'none',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: 0,
      enterprise: null,
      custom: null,
    },
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'audit-logs',
    name: 'Audit Logs',
    description: 'Comprehensive activity tracking and compliance',
    category: 'security',
    access: {
      free: 'none',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: 30, // 30 days retention
      enterprise: 365, // 365 days retention
      custom: null,
    },
    icon: <FileText className="h-5 w-5" />,
  },
  
  // Integration Features
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Programmatic access to platform features',
    category: 'integrations',
    access: {
      free: 'none',
      pro: 'limited',
      enterprise: 'full',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: 1000, // 1000 requests per day
      enterprise: 10000, // 10000 requests per day
      custom: null,
    },
    icon: <Code className="h-5 w-5" />,
    usageMetric: 'api_requests',
  },
  {
    id: 'custom-integrations',
    name: 'Custom Integrations',
    description: 'Build custom integrations with your tools',
    category: 'integrations',
    access: {
      free: 'none',
      pro: 'none',
      enterprise: 'limited',
      custom: 'full',
    },
    limits: {
      free: 0,
      pro: 0,
      enterprise: 5, // 5 custom integrations
      custom: null,
    },
    icon: <Puzzle className="h-5 w-5" />,
  },
];

const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    description: 'For individuals getting started with basic features',
    price: {
      monthly: 0,
      annual: 0,
    },
    features: [
      'ai-gateway',
      'universal-feedback',
      'realtime-collaboration',
      'team-members',
      'projects',
      'storage',
    ],
    limits: {
      'ai-gateway': 10,
      'team-members': 3,
      'projects': 3,
      'storage': 5,
      'realtime-collaboration': 3,
    },
    stripePriceId: {
      monthly: '',
      annual: '',
    },
    icon: <User className="h-5 w-5" />,
  },
  {
    id: 'pro',
    tier: 'pro',
    name: 'Pro',
    description: 'For professionals and small teams needing more power',
    price: {
      monthly: 29,
      annual: 290, // ~2 months free
    },
    features: [
      'ai-gateway',
      'video-intelligence',
      'multimodal-ai',
      'universal-feedback',
      'realtime-collaboration',
      'team-members',
      'projects',
      'advanced-project-analytics',
      'storage',
      'priority-support',
      'audit-logs',
      'api-access',
    ],
    limits: {
      'ai-gateway': 1000,
      'video-intelligence': 50,
      'multimodal-ai': 100,
      'team-members': 10,
      'projects': 20,
      'storage': 100,
      'realtime-collaboration': 10,
      'audit-logs': 30,
      'api-access': 1000,
    },
    stripePriceId: {
      monthly: 'price_1OXYZabcdefghijk12345678',
      annual: 'price_1OXYZabcdefghijk87654321',
    },
    popular: true,
    badge: 'Most Popular',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations requiring advanced features and support',
    price: {
      monthly: 99,
      annual: 990, // ~2 months free
    },
    features: [
      'ai-gateway',
      'video-intelligence',
      'multimodal-ai',
      'predictive-analytics',
      'universal-feedback',
      'realtime-collaboration',
      'team-members',
      'projects',
      'advanced-project-analytics',
      'storage',
      'priority-support',
      'dedicated-success-manager',
      'sso',
      'audit-logs',
      'api-access',
      'custom-integrations',
    ],
    limits: {
      'ai-gateway': null,
      'video-intelligence': null,
      'multimodal-ai': 1000,
      'team-members': 100,
      'projects': null,
      'storage': 1000,
      'realtime-collaboration': null,
      'audit-logs': 365,
      'api-access': 10000,
      'custom-integrations': 5,
    },
    stripePriceId: {
      monthly: 'price_1OXYZabcdefghijk23456789',
      annual: 'price_1OXYZabcdefghijk98765432',
    },
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: 'custom',
    tier: 'custom',
    name: 'Custom',
    description: 'For large enterprises with custom requirements',
    price: {
      monthly: -1, // Custom pricing
      annual: -1, // Custom pricing
    },
    features: DEFAULT_FEATURES.map(f => f.id),
    limits: {},
    stripePriceId: {
      monthly: '',
      annual: '',
    },
    icon: <Crown className="h-5 w-5" />,
  },
];

// ===== HELPER COMPONENTS =====

const HardDrive: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12h20M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6M2 12V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const Headset: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 11h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2" />
  </svg>
);

const UserCheck: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m16 11 2 2 4-4" />
  </svg>
);

const Code: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const Puzzle: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 9l-5-5V1H8v3L3 9h3v5H3l5 5v3h6v-3l5-5h-3V9z" />
  </svg>
);

const User: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MessageSquare: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ===== MAIN COMPONENTS =====

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred while processing your payment.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment successful',
          description: 'Your subscription has been activated.',
          duration: 5000,
        });
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Subscribe'
          )}
        </Button>
      </div>
    </form>
  );
};

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier?: SubscriptionTier;
  onSuccess: () => void;
}

const UpgradeDialog: React.FC<UpgradeDialogProps> = ({ 
  isOpen, 
  onClose, 
  selectedTier = 'pro',
  onSuccess,
}) => {
  const [tier, setTier] = useState<SubscriptionTier>(selectedTier);
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'plan' | 'payment'>('plan');
  const supabase = useSupabaseClient();
  const user = useUser();
  
  const selectedPlan = useMemo(() => {
    return DEFAULT_PRICING_PLANS.find(plan => plan.tier === tier);
  }, [tier]);
  
  const handleContinue = async () => {
    if (!user || !selectedPlan) return;
    
    setIsLoading(true);
    
    try {
      // Create subscription intent on the server
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan.stripePriceId[interval],
          interval,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }
      
      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to set up subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePaymentSuccess = () => {
    onSuccess();
    onClose();
    toast({
      title: 'Subscription activated',
      description: `You've successfully subscribed to the ${selectedPlan?.name} plan.`,
    });
  };
  
  const handleEnterpriseContact = async () => {
    setIsLoading(true);
    
    try {
      // Log enterprise interest
      if (user) {
        await supabase
          .from('enterprise_leads')
          .insert({
            user_id: user.id,
            status: 'new',
            created_at: new Date().toISOString(),
          });
      }
      
      // Send to enterprise contact form
      onClose();
      // This would typically navigate to an enterprise contact form
      // or open a different dialog
      
      toast({
        title: 'Thank you for your interest',
        description: 'Our team will contact you shortly to discuss enterprise options.',
      });
    } catch (error) {
      console.error('Error logging enterprise interest:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'plan' ? 'Upgrade Your Plan' : 'Complete Your Subscription'}
          </DialogTitle>
          <DialogDescription>
            {step === 'plan' 
              ? 'Choose the plan that works best for you and your team.'
              : 'Enter your payment details to activate your subscription.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 'plan' ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-muted inline-flex rounded-lg p-1">
                <Button
                  variant={interval === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setInterval('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={interval === 'annual' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setInterval('annual')}
                >
                  Annual
                  <Badge variant="outline" className="ml-2 bg-primary/20 text-primary">
                    Save 20%
                  </Badge>
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DEFAULT_PRICING_PLANS.filter(plan => plan.tier !== 'custom').map(plan => (
                <Card 
                  key={plan.id} 
                  className={cn(
                    "flex flex-col",
                    tier === plan.tier && "border-primary",
                    plan.popular && "shadow-md"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                          {plan.icon}
                        </div>
                        <CardTitle>{plan.name}</CardTitle>
                      </div>
                      {plan.badge && (
                        <Badge variant="secondary">{plan.badge}</Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">
                        {plan.price[interval] === 0 
                          ? 'Free' 
                          : `$${plan.price[interval]}`}
                      </span>
                      {plan.price[interval] > 0 && (
                        <span className="text-muted-foreground ml-1">
                          /{interval === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2 text-sm">
                      {plan.features.slice(0, 5).map(featureId => {
                        const feature = DEFAULT_FEATURES.find(f => f.id === featureId);
                        if (!feature) return null;
                        
                        const limit = plan.limits[featureId];
                        const limitText = limit 
                          ? ` (${limit === -1 ? 'Unlimited' : limit}${feature.usageMetric ? '' : ''})` 
                          : '';
                          
                        return (
                          <li key={featureId} className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span>
                              {feature.name}
                              {limitText && (
                                <span className="text-muted-foreground">{limitText}</span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                      {plan.features.length > 5 && (
                        <li className="text-muted-foreground">
                          + {plan.features.length - 5} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={tier === plan.tier ? "default" : "outline"}
                      onClick={() => setTier(plan.tier)}
                    >
                      {tier === plan.tier ? 'Selected' : 'Select'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Custom Enterprise Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                      <Crown className="h-5 w-5" />
                    </div>
                    <CardTitle>Enterprise</CardTitle>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">Custom</span>
                  </div>
                  <CardDescription>For large organizations with custom needs</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>All features included</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Unlimited team members</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Custom integrations</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Dedicated success manager</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Custom contracts & SLAs</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleEnterpriseContact}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Contact Sales'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={isLoading || tier === 'custom' || tier === 'free'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm 
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setStep('plan')}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface FeatureLimitProps {
  feature: Feature;
  subscription: UserSubscription | null;
  usageMetrics?: UsageMetrics;
}

const FeatureLimit: React.FC<FeatureLimitProps> = ({ 
  feature, 
  subscription, 
  usageMetrics 
}) => {
  const tier = subscription?.tier || 'free';
  const limit = DEFAULT_PRICING_PLANS.find(p => p.tier === tier)?.limits[feature.id];
  const usage = usageMetrics?.count || 0;
  
  // If feature is not available or has no limit
  if (feature.access[tier] === 'none' || limit === null || limit === undefined) {
    return null;
  }
  
  const percentage = Math.min(100, Math.round((usage / limit) * 100));
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={cn(
          isAtLimit ? "text-red-600 font-medium" : 
          isNearLimit ? "text-amber-600 font-medium" : 
          "text-muted-foreground"
        )}>
          {usage} / {limit} {feature.usageMetric?.replace(/_/g, ' ')}
        </span>
        <span className={cn(
          isAtLimit ? "text-red-600 font-medium" : 
          isNearLimit ? "text-amber-600 font-medium" : 
          "text-muted-foreground"
        )}>
          {percentage}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          "h-1.5",
          isAtLimit ? "bg-red-100" : isNearLimit ? "bg-amber-100" : ""
        )}
        indicatorClassName={cn(
          isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : ""
        )}
      />
      {isNearLimit && (
        <p className="text-xs mt-1 text-amber-600">
          {isAtLimit ? (
            <span className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Limit reached. Upgrade to continue using this feature.
            </span>
          ) : (
            <span>Approaching limit. Consider upgrading soon.</span>
          )}
        </p>
      )}
    </div>
  );
};

interface FeatureCardProps {
  feature: Feature;
  subscription: UserSubscription | null;
  usageMetrics?: UsageMetrics;
  onUpgrade: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  feature, 
  subscription, 
  usageMetrics,
  onUpgrade
}) => {
  const tier = subscription?.tier || 'free';
  const access = feature.access[tier];
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-primary/10 p-1.5 text-primary">
              {feature.icon || <Sparkles className="h-5 w-5" />}
            </div>
            <CardTitle className="text-base">{feature.name}</CardTitle>
          </div>
          {feature.beta && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Beta
            </Badge>
          )}
          {feature.comingSoon && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Coming Soon
            </Badge>
          )}
        </div>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div className="flex items-center">
          {access === 'full' ? (
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <Check className="h-3.5 w-3.5 mr-1" />
              Full Access
            </Badge>
          ) : access === 'limited' ? (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Limited Access
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-500 border-gray-200">
              <Lock className="h-3.5 w-3.5 mr-1" />
              No Access
            </Badge>
          )}
        </div>
        
        {access !== 'none' && (
          <FeatureLimit 
            feature={feature} 
            subscription={subscription} 
            usageMetrics={usageMetrics} 
          />
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {access === 'none' ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onUpgrade}
          >
            <Unlock className="h-3.5 w-3.5 mr-1.5" />
            Upgrade to Unlock
          </Button>
        ) : access === 'limited' ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onUpgrade}
          >
            <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
            Upgrade for More
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground"
            disabled
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Full Access
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

interface PricingTableProps {
  onUpgrade: (tier: SubscriptionTier) => void;
  currentTier?: SubscriptionTier;
}

const PricingTable: React.FC<PricingTableProps> = ({ 
  onUpgrade,
  currentTier = 'free'
}) => {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  
  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="bg-muted inline-flex rounded-lg p-1">
          <Button
            variant={interval === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInterval('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={interval === 'annual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInterval('annual')}
          >
            Annual
            <Badge variant="outline" className="ml-2 bg-primary/20 text-primary">
              Save 20%
            </Badge>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 border-b"></th>
              {DEFAULT_PRICING_PLANS.filter(plan => plan.tier !== 'custom').map(plan => (
                <th 
                  key={plan.id} 
                  className={cn(
                    "p-4 border-b text-center min-w-[160px]",
                    plan.tier === currentTier && "bg-primary/5"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                        {plan.icon}
                      </div>
                      <span className="font-bold">{plan.name}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold">
                        {plan.price[interval] === 0 
                          ? 'Free' 
                          : `$${plan.price[interval]}`}
                      </span>
                      {plan.price[interval] > 0 && (
                        <span className="text-muted-foreground text-sm ml-1">
                          /{interval === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      variant={plan.tier === currentTier ? "secondary" : "default"}
                      disabled={plan.tier === currentTier}
                      onClick={() => onUpgrade(plan.tier)}
                    >
                      {plan.tier === currentTier ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </div>
                </th>
              ))}
              <th className="p-4 border-b text-center min-w-[160px]">
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                      <Crown className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Enterprise</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl font-bold">Custom</span>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => onUpgrade('custom')}
                  >
                    Contact Us
                  </Button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Group features by category */}
            {(Object.keys(DEFAULT_FEATURES.reduce((acc, feature) => {
              acc[feature.category] = true;
              return acc;
            }, {} as Record<FeatureCategory, boolean>)) as FeatureCategory[]).map(category => (
              <React.Fragment key={category}>
                <tr>
                  <td 
                    colSpan={DEFAULT_PRICING_PLANS.length + 2} 
                    className="p-4 bg-muted/50 font-medium"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} Features
                  </td>
                </tr>
                {DEFAULT_FEATURES.filter(feature => feature.category === category).map(feature => (
                  <tr key={feature.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                    </td>
                    {DEFAULT_PRICING_PLANS.filter(plan => plan.tier !== 'custom').map(plan => {
                      const access = feature.access[plan.tier];
                      const limit = plan.limits[feature.id];
                      
                      return (
                        <td 
                          key={plan.id} 
                          className={cn(
                            "p-4 text-center",
                            plan.tier === currentTier && "bg-primary/5"
                          )}
                        >
                          {access === 'full' ? (
                            <div className="flex flex-col items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              {limit !== undefined && limit !== null && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {limit === -1 ? 'Unlimited' : limit}
                                </span>
                              )}
                            </div>
                          ) : access === 'limited' ? (
                            <div className="flex flex-col items-center">
                              <div className="text-amber-500">Limited</div>
                              {limit !== undefined && limit !== null && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {limit === -1 ? 'Unlimited' : limit}
                                </span>
                              )}
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 bg-muted/30 p-6 rounded-lg border text-center">
        <h3 className="text-lg font-semibold mb-2">Need a custom solution?</h3>
        <p className="text-muted-foreground mb-4">
          Contact our sales team for custom pricing and enterprise features.
        </p>
        <Button onClick={() => onUpgrade('custom')}>
          <Building className="h-4 w-4 mr-2" />
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

interface UpgradePromptProps {
  feature?: Feature;
  type?: 'inline' | 'modal' | 'banner';
  onUpgrade: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature, 
  type = 'inline',
  onUpgrade 
}) => {
  if (type === 'banner') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-blue-100 p-2 text-blue-700">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Unlock premium features</h3>
              <p className="text-blue-700 text-sm mt-1">
                Upgrade your plan to access advanced AI features, unlimited projects, and priority support.
              </p>
            </div>
          </div>
          <Button 
            size="sm"
            onClick={onUpgrade}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }
  
  if (type === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Lock className="h-4 w-4 mr-2" />
            Unlock Feature
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade to unlock {feature?.name || 'premium features'}</DialogTitle>
            <DialogDescription>
              {feature
                ? feature.description
                : 'Get access to advanced features and higher usage limits with a premium plan.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Access to all premium features
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Higher usage limits
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full sm:w-auto">
              See Plans
            </Button>
            <Button onClick={onUpgrade} className="w-full sm:w-auto">
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Default inline
  return (
    <div className="bg-muted/50 border rounded-lg p-4 flex flex-col items-center text-center">
      <div className="rounded-full bg-primary/10 p-2 text-primary mb-3">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="font-medium mb-1">
        {feature ? `Unlock ${feature.name}` : 'Unlock Premium Features'}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {feature
          ? feature.description
          : 'Upgrade your plan to access advanced features and higher usage limits.'}
      </p>
      <Button size="sm" onClick={onUpgrade}>
        Upgrade Now
      </Button>
    </div>
  );
};

interface RetentionPromptProps {
  offer: RetentionOffer;
  onAccept: (offerId: string) => void;
  onDismiss: () => void;
}

const RetentionPrompt: React.FC<RetentionPromptProps> = ({ 
  offer, 
  onAccept, 
  onDismiss 
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-4">
          <div className="rounded-full bg-amber-100 p-2 text-amber-700">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">{offer.name}</h3>
            <p className="text-amber-700 text-sm mt-1">
              {offer.description}
            </p>
            <p className="text-amber-900 font-medium text-sm mt-2">
              {offer.discountPercentage}% off for {offer.durationMonths} months
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <Button 
            size="sm"
            onClick={() => onAccept(offer.id)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Accept Offer
          </Button>
          <Button 
            size="sm"
            variant="ghost"
            onClick={onDismiss}
          >
            No Thanks
          </Button>
        </div>
      </div>
    </div>
  );
};

interface UsageChartProps {
  data: {
    date: string;
    value: number;
  }[];
  title: string;
  description?: string;
  limit?: number;
}

const UsageChart: React.FC<UsageChartProps> = ({ 
  data, 
  title, 
  description,
  limit 
}) => {
  // This is a placeholder for a real chart component
  // In a real implementation, you would use a library like recharts or chart.js
  
  const maxValue = Math.max(...data.map(d => d.value), limit || 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {/* Placeholder for chart */}
          <div className="h-full w-full bg-muted/20 rounded-md flex items-center justify-center">
            <div className="text-muted-foreground">
              Chart visualization would appear here
            </div>
          </div>
        </div>
        {limit && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Usage</span>
              <span>{data[data.length - 1]?.value || 0} / {limit}</span>
            </div>
            <Progress 
              value={(data[data.length - 1]?.value || 0) / limit * 100} 
              className="h-1.5"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface RevenueDashboardProps {
  metrics: RevenueMetrics;
}

const RevenueDashboard: React.FC<RevenueDashboardProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.historicalData.length > 1 && (
                <>
                  {metrics.mrr > metrics.historicalData[metrics.historicalData.length - 2].mrr ? (
                    <span className="text-green-600">↑</span>
                  ) : (
                    <span className="text-red-600">↓</span>
                  )}
                  {' '}
                  {Math.abs(((metrics.mrr - metrics.historicalData[metrics.historicalData.length - 2].mrr) / 
                    metrics.historicalData[metrics.historicalData.length - 2].mrr) * 100).toFixed(1)}% from last month
                </>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.customers.total)}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Free: {metrics.customers.free}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span>Pro: {metrics.customers.pro}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <span>Ent: {metrics.customers.enterprise}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.churnRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt; 5%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Revenue Per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageRevenuePerUser)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              LTV: {formatCurrency(metrics.lifetimeValue)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {/* Placeholder for chart */}
              <div className="h-full w-full bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-muted-foreground">
                  Revenue chart would appear here
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>New vs churned customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {/* Placeholder for chart */}
              <div className="h-full w-full bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-muted-foreground">
                  Customer chart would appear here
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Free to paid conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative h-40 w-40">
                {/* Placeholder for chart */}
                <div className="h-full w-full rounded-full border-8 border-muted flex items-center justify-center">
                  <div className="text-2xl font-bold">
                    {(metrics.conversionRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Target: &gt; 5%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Customers by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {/* Placeholder for chart */}
              <div className="h-full w-full bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-muted-foreground">
                  Plan distribution chart would appear here
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>Most popular premium features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span>AI Gateway</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-1.5" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span>Universal Feedback</span>
                  <span>87%</span>
                </div>
                <Progress value={87} className="h-1.5" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span>Video Intelligence</span>
                  <span>64%</span>
                </div>
                <Progress value={64} className="h-1.5" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span>Real-time Collaboration</span>
                  <span>58%</span>
                </div>
                <Progress value={58} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface EnterpriseLeadFormProps {
  onSubmit: (lead: Omit<EnterpriseLead, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  onCancel: () => void;
}

const EnterpriseLeadForm: React.FC<EnterpriseLeadFormProps> = ({ onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    employees: '',
    requirements: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      toast({
        title: 'Request submitted',
        description: 'Our sales team will contact you shortly.',
      });
    } catch (error) {
      console.error('Error submitting enterprise lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="employees">Company Size *</Label>
        <Select
          name="employees"
          value={formData.employees}
          onValueChange={(value) => setFormData(prev => ({ ...prev, employees: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-500">201-500 employees</SelectItem>
            <SelectItem value="501-1000">501-1000 employees</SelectItem>
            <SelectItem value="1001+">1001+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements *</Label>
        <textarea
          id="requirements"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          className="w-full min-h-[100px] p-2 border rounded-md"
          placeholder="Please describe your requirements and use cases..."
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel
