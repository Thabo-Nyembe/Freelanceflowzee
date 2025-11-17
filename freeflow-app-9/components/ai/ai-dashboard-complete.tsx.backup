/**
 * @file AI Dashboard Complete
 * @description A comprehensive dashboard for monitoring and managing AI processing jobs,
 * costs, performance metrics, and settings across the KAZI platform.
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  BarChart,
  CalendarIcon,
  Check,
  ChevronDown,
  DollarSign,
  Download,
  ExternalLink,
  Filter,
  FileText,
  Globe,
  HelpCircle,
  Info,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Pie,
  RefreshCw,
  Search,
  Server,
  Settings,
  Sliders,
  ThumbsUp,
  Trash,
  TrendingUp,
  Video,
  Wallet,
  X,
  Zap
} from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/error-boundary';
import { EnhancedNavigation } from '@/components/enhanced-navigation';
import { ContextualSidebar } from '@/components/contextual-sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Recharts components for data visualization
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis
} from 'recharts';

// Type definitions
interface AIProcessingJob {
  id: string;
  user_id: string;
  project_id: string;
  video_path: string;
  options: AIProcessingOptions;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface AIProcessingOptions {
  transcription: boolean;
  sentiment: boolean;
  chapters: boolean;
  speakerDiarization: boolean;
  keywords: boolean;
  entities: boolean;
  analytics: boolean;
  preferredProvider?: 'assemblyai' | 'openai' | 'deepgram';
  language?: string;
  webhookUrl?: string;
}

interface AIProcessingResult {
  id: string;
  videoId: string;
  transcription: TranscriptionSegment[];
  chapters: VideoChapter[];
  analytics: VideoAnalytics;
  processingTime: number;
  cost: number;
  provider: string;
}

interface TranscriptionSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  speaker?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  keywords?: string[];
  entities?: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
}

interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
  keyTopics: string[];
}

interface VideoAnalytics {
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
  heatmapData: { timestamp: number; engagement: number }[];
  topMoments: { timestamp: number; description: string; score: number }[];
  viewerDropoff: { timestamp: number; dropoffRate: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
}

interface AIProvider {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: number;
  uptime: number;
  costPerUnit: number;
  quotaUsed: number;
  quotaTotal: number;
  features: string[];
  lastChecked: string;
  responseTime: number[];
  errorRate: number;
  successfulCalls: number;
  failedCalls: number;
  costEfficiency: number;
  apiVersion: string;
  region: string;
  endpoint: string;
  documentation: string;
}

interface AIModelMetrics {
  modelId: string;
  provider: string;
  name: string;
  type: 'transcription' | 'sentiment' | 'summarization' | 'generation' | 'vision';
  accuracy: number;
  latency: number;
  costPerToken: number;
  usageCount: number;
  errorRate: number;
  lastUpdated: string;
  contextLength: number;
  tokensPerSecond: number;
  supportedLanguages: string[];
  capabilities: string[];
  trainingData: string;
  versionHistory: {
    version: string;
    releaseDate: string;
    changes: string[];
  }[];
}

interface CostData {
  date: string;
  transcription: number;
  sentiment: number;
  chapters: number;
  speakerDiarization: number;
  entities: number;
  total: number;
}

interface QuotaUsage {
  userId: string;
  used: number;
  total: number;
  resetDate: string;
  tier: 'free' | 'pro' | 'enterprise';
  history: Array<{
    date: string;
    used: number;
  }>;
  features: {
    [key: string]: {
      used: number;
      limit: number;
    };
  };
  billingCycle: {
    start: string;
    end: string;
  };
  additionalQuotaPurchases: Array<{
    date: string;
    amount: number;
    cost: number;
    transactionId: string;
  }>;
}

interface AIError {
  id: string;
  timestamp: string;
  jobId?: string;
  provider?: string;
  errorCode: string;
  message: string;
  details?: any;
  status: 'new' | 'investigating' | 'resolved';
  impact: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  resolution?: string;
  resolutionDate?: string;
  affectedUsers?: number;
  errorType: 'api' | 'processing' | 'authentication' | 'quota' | 'timeout' | 'other';
  requestId?: string;
  httpStatus?: number;
  stackTrace?: string;
  relatedErrors?: string[];
}

interface AISettings {
  defaultProvider: 'assemblyai' | 'openai' | 'deepgram' | 'auto';
  fallbackProviders: ('assemblyai' | 'openai' | 'deepgram')[];
  defaultLanguage: string;
  autoTranscribe: boolean;
  autoSentiment: boolean;
  autoChapters: boolean;
  costAlertThreshold: number;
  enableRealTimeProcessing: boolean;
  qualityPreference: 'speed' | 'accuracy' | 'balanced';
  webhookUrl?: string;
  cacheResults: boolean;
  cacheTTL: number;
  notifications: {
    email: boolean;
    inApp: boolean;
    slack?: string;
    jobCompletion: boolean;
    jobFailure: boolean;
    quotaWarning: boolean;
    costAlerts: boolean;
    providerOutages: boolean;
  };
  security: {
    encryptResults: boolean;
    accessControl: 'private' | 'team' | 'public';
    retentionPeriod: number; // days
    dataRegion?: string;
  };
  performance: {
    parallelJobs: number;
    priorityQueue: boolean;
    autoScaling: boolean;
    batchProcessing: boolean;
  };
}

interface WebSocketStatus {
  connected: boolean;
  lastMessageReceived?: string;
  reconnectAttempts: number;
  latency: number;
}

interface DashboardFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  status?: 'queued' | 'processing' | 'completed' | 'failed' | 'all';
  provider?: string;
  search: string;
  costRange?: {
    min: number;
    max: number;
  };
  errorImpact?: 'low' | 'medium' | 'high' | 'critical' | 'all';
  errorStatus?: 'new' | 'investigating' | 'resolved' | 'all';
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  implemented: boolean;
  category: 'cost' | 'performance' | 'quality' | 'security';
  impact: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  affectedComponents: string[];
  createdAt: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
  metric?: string;
  value?: number;
  threshold?: number;
  change?: number;
  timeframe?: string;
  relatedInsights?: string[];
  actions?: {
    label: string;
    action: string;
  }[];
}

interface AIModelComparison {
  feature: string;
  openai: number;
  assemblyai: number;
  deepgram: number;
}

interface AIUsageTrend {
  month: string;
  usage: number;
  cost: number;
  jobs: number;
}

interface AIPerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

/**
 * AI Dashboard Complete Component
 * @returns React component
 */
export function AIDashboardComplete() {
  // Router and navigation
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const isDesktop = useMediaQuery("(min-width: 1024px)");"
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const chartRefs = useRef<{[key: string]: any}>({});
  
  // State management
  const [activeTab, setActiveTab] = useState("overview");"
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<AIProcessingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<AIProcessingJob | null>(null);
  const [jobResults, setJobResults] = useState<AIProcessingResult | null>(null);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModelMetrics[]>([]);
  const [costData, setCostData] = useState<CostData[]>([]);
  const [quotaUsage, setQuotaUsage] = useState<QuotaUsage | null>(null);
  const [errors, setErrors] = useState<AIError[]>([]);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>({
    connected: false,
    reconnectAttempts: 0,
    latency: 0
  });
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [modelComparison, setModelComparison] = useState<AIModelComparison[]>([]);
  const [usageTrends, setUsageTrends] = useState<AIUsageTrend[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<AIPerformanceMetric[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date()
    },
    status: 'all',
    search: '',
    errorImpact: 'all',
    errorStatus: 'all'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [settings, setSettings] = useLocalStorage<AISettings>("ai-dashboard-settings", {"
    defaultProvider: 'auto',
    fallbackProviders: ['assemblyai', 'openai', 'deepgram'],
    defaultLanguage: 'en',
    autoTranscribe: true,
    autoSentiment: true,
    autoChapters: true,
    costAlertThreshold: 50,
    enableRealTimeProcessing: true,
    qualityPreference: 'balanced',
    cacheResults: true,
    cacheTTL: 86400, // 24 hours in seconds
    notifications: {
      email: true,
      inApp: true,
      jobCompletion: true,
      jobFailure: true,
      quotaWarning: true,
      costAlerts: true,
      providerOutages: true
    },
    security: {
      encryptResults: false,
      accessControl: 'team',
      retentionPeriod: 90,
      dataRegion: 'us-west'
    },
    performance: {
      parallelJobs: 3,
      priorityQueue: true,
      autoScaling: true,
      batchProcessing: false
    }
  });
  const [selectedError, setSelectedError] = useState<AIError | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelMetrics | null>(null);
  const [isSettingsChanged, setIsSettingsChanged] = useState(false);
  const [tempSettings, setTempSettings] = useState<AISettings | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");"
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  // Debounced search
  const handleSearch = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, 500);
  
  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Date range filter
      const jobDate = new Date(job.created_at);
      const fromDate = filters.dateRange.from;
      const toDate = filters.dateRange.to;
      
      if (fromDate && jobDate < fromDate) return false;
      if (toDate && jobDate > toDate) return false;
      
      // Status filter
      if (filters.status && filters.status !== 'all' && job.status !== filters.status) return false;
      
      // Provider filter
      if (filters.provider && job.options.preferredProvider !== filters.provider) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return job.id.toLowerCase().includes(searchLower) || 
               job.video_path.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }, [jobs, filters]);
  
  // Filtered errors
  const filteredErrors = useMemo(() => {
    return errors.filter(error => {
      // Impact filter
      if (filters.errorImpact && filters.errorImpact !== 'all' && error.impact !== filters.errorImpact) return false;
      
      // Status filter
      if (filters.errorStatus && filters.errorStatus !== 'all' && error.status !== filters.errorStatus) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return error.id.toLowerCase().includes(searchLower) || 
               error.message.toLowerCase().includes(searchLower) ||
               error.errorCode.toLowerCase().includes(searchLower) ||
               (error.provider && error.provider.toLowerCase().includes(searchLower));
      }
      
      return true;
    });
  }, [errors, filters]);
  
  // Initialize WebSocket connection
  const initWebSocket = useCallback(() => {
    if (!user) return;
    
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Create new WebSocket connection
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ai/websocket?userId=${user.id}`);
    
    // Store reference
    wsRef.current = ws;
    
    // Track connection start time for latency calculation
    const connectionStartTime = Date.now();
    
    // Connection opened
    ws.addEventListener('open', () => {
      setWsStatus(prev => ({
        ...prev,
        connected: true,
        reconnectAttempts: 0,
        latency: Date.now() - connectionStartTime
      }));
      
      // Send authentication message
      ws.send(JSON.stringify({
        type: 'authenticate',
        userId: user.id
      }));
    });
    
    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update last message received time
        setWsStatus(prev => ({
          ...prev,
          lastMessageReceived: new Date().toISOString()
        }));
        
        // Handle different message types
        switch (data.type) {
          case 'status_update':
            // Update job status
            setJobs(prev => prev.map(job => 
              job.id === data.jobId 
                ? { 
                    ...job, 
                    status: data.status || job.status,
                    progress: data.progress !== undefined ? data.progress : job.progress,
                    error: data.error || job.error,
                    updated_at: data.timestamp || job.updated_at
                  }
                : job
            ));
            break;
            
          case 'transcription_complete':
            // Update job results with transcription
            if (selectedJob?.id === data.jobId) {
              setJobResults(prev => prev ? {
                ...prev,
                transcription: data.segments
              } : null);
            }
            break;
            
          case 'chapters_complete':
            // Update job results with chapters
            if (selectedJob?.id === data.jobId) {
              setJobResults(prev => prev ? {
                ...prev,
                chapters: data.chapters
              } : null);
            }
            break;
            
          case 'analytics_update':
            // Update job results with analytics
            if (selectedJob?.id === data.jobId) {
              setJobResults(prev => prev ? {
                ...prev,
                analytics: data.analytics
              } : null);
            }
            break;
            
          case 'processing_complete':
            // Show toast notification
            toast({
              title: "Processing Complete","
              description: `Job ${data.jobId.substring(0, 8)}... has been completed successfully.`,
              variant: "success""
            });
            
            // Refresh jobs list
            fetchJobs();
            break;
            
          case 'processing_error':
            // Show toast notification
            toast({
              title: "Processing Error","
              description: data.error || "An unknown error occurred","
              variant: "destructive""
            });
            
            // Add to errors list
            setErrors(prev => [
              {
                id: `error-${Date.now()}`,
                timestamp: new Date().toISOString(),
                jobId: data.jobId,
                errorCode: 'PROCESSING_ERROR',
                message: data.error || "An unknown error occurred","
                status: 'new',
                impact: 'medium',
                errorType: 'processing'
              },
              ...prev
            ]);
            break;
            
          case 'provider_status':
            // Update provider status
            setProviders(prev => prev.map(provider => 
              provider.id === data.providerId 
                ? { ...provider, ...data.status }
                : provider
            ));
            break;
            
          case 'quota_update':
            // Update quota usage
            if (data.userId === user.id) {
              setQuotaUsage(prev => prev ? {
                ...prev,
                used: data.used,
                total: data.total,
                features: data.features || prev.features
              } : null);
            }
            break;
            
          case 'cost_alert':
            // Show cost alert
            if (data.userId === user.id) {
              toast({
                title: "Cost Alert","
                description: `Your AI processing costs have reached ${data.percentage}% of your threshold ($${settings.costAlertThreshold}).`,
                variant: "warning""
              });
            }
            break;
            
          case 'new_insight':
            // Add new insight
            setInsights(prev => [data.insight, ...prev]);
            break;
            
          case 'new_recommendation':
            // Add new recommendation
            setRecommendations(prev => [data.recommendation, ...prev]);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message', error);
      }
    });
    
    // Handle connection close
    ws.addEventListener('close', () => {
      setWsStatus(prev => ({
        ...prev,
        connected: false
      }));
      
      // Attempt to reconnect after delay
      setTimeout(() => {
        setWsStatus(prev => ({
          ...prev,
          reconnectAttempts: prev.reconnectAttempts + 1
        }));
        
        // Only try to reconnect if component is still mounted
        initWebSocket();
      }, 3000);
    });
    
    // Handle connection error
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error', error);
      setWsStatus(prev => ({
        ...prev,
        connected: false
      }));
    });
    
    // Ping to keep connection alive and measure latency
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const pingStartTime = Date.now();
        ws.send(JSON.stringify({ type: 'ping', timestamp: pingStartTime }));
        
        // Listen for pong response to calculate latency
        const pongHandler = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'pong' && data.timestamp === pingStartTime) {
              setWsStatus(prev => ({
                ...prev,
                latency: Date.now() - pingStartTime
              }));
              ws.removeEventListener('message', pongHandler);
            }
          } catch (error) {
            // Ignore parsing errors for non-pong messages
          }
        };
        
        ws.addEventListener('message', pongHandler);
      }
    }, 30000);
    
    // Clean up on unmount
    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, toast, settings.costAlertThreshold]);
  
  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs', error);
      toast({
        title: "Error","
        description: "Failed to fetch processing jobs","
        variant: "destructive""
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase, toast]);
  
  // Fetch job results
  const fetchJobResults = useCallback(async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('processing_results')
        .select('*')
        .eq('videoId', jobId)
        .single();
        
      if (error) throw error;
      
      setJobResults(data);
    } catch (error) {
      console.error('Error fetching job results', error);
      setJobResults(null);
    }
  }, [supabase]);
  
  // Fetch providers status
  const fetchProviders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*');
        
      if (error) throw error;
      
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers', error);
    }
  }, [supabase]);
  
  // Fetch model metrics
  const fetchModelMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_metrics')
        .select('*');
        
      if (error) throw error;
      
      setModels(data || []);
    } catch (error) {
      console.error('Error fetching model metrics', error);
    }
  }, [supabase]);
  
  // Fetch cost data
  const fetchCostData = useCallback(async () => {
    if (!user) return;
    
    try {
      const { from, to } = filters.dateRange;
      
      const { data, error } = await supabase
        .from('cost_tracking')
        .select('*')
        .eq('userId', user.id)
        .gte('timestamp', from ? from.toISOString() : undefined)
        .lte('timestamp', to ? to.toISOString() : undefined);
        
      if (error) throw error;
      
      // Process and aggregate cost data by date
      const costByDate = data.reduce((acc: Record<string, CostData>, item) => {
        const date = item.timestamp.split('T')[0];
        
        if (!acc[date]) {
          acc[date] = {
            date,
            transcription: 0,
            sentiment: 0,
            chapters: 0,
            speakerDiarization: 0,
            entities: 0,
            total: 0
          };
        }
        
        // Update specific operation cost
        switch (item.operation) {
          case 'transcription':
            acc[date].transcription += item.cost;
            break;
          case 'sentiment':
            acc[date].sentiment += item.cost;
            break;
          case 'chapters':
            acc[date].chapters += item.cost;
            break;
          case 'speaker_diarization':
            acc[date].speakerDiarization += item.cost;
            break;
          case 'entities':
            acc[date].entities += item.cost;
            break;
        }
        
        // Update total
        acc[date].total += item.cost;
        
        return acc;
      }, {});
      
      // Convert to array and sort by date
      const costArray = Object.values(costByDate).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setCostData(costArray);
    } catch (error) {
      console.error('Error fetching cost data', error);
    }
  }, [user, supabase, filters.dateRange]);
  
  // Fetch quota usage
  const fetchQuotaUsage = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      // Fetch quota usage history
      const { data: historyData, error: historyError } = await supabase
        .from('quota_usage_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);
        
      if (historyError) throw historyError;
      
      // Fetch feature-specific quotas
      const { data: featureData, error: featureError } = await supabase
        .from('feature_quotas')
        .select('*')
        .eq('user_id', user.id);
        
      if (featureError) throw featureError;
      
      // Process feature quotas
      const features: QuotaUsage['features'] = {};
      featureData.forEach((item) => {
        features[item.feature] = {
          used: item.used_quota,
          limit: item.total_quota
        };
      });
      
      // Fetch additional quota purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('quota_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      if (purchaseError) throw purchaseError;
      
      setQuotaUsage({
        userId: user.id,
        used: data.used_quota,
        total: data.total_quota,
        resetDate: data.reset_date,
        tier: data.tier,
        history: historyData.map(item => ({
          date: item.date,
          used: item.used_quota
        })),
        features,
        billingCycle: {
          start: data.billing_cycle_start,
          end: data.billing_cycle_end
        },
        additionalQuotaPurchases: purchaseData.map(item => ({
          date: item.date,
          amount: item.amount,
          cost: item.cost,
          transactionId: item.transaction_id
        }))
      });
    } catch (error) {
      console.error('Error fetching quota usage', error);
    }
  }, [user, supabase]);
  
  // Fetch errors
  const fetchErrors = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_errors')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      setErrors(data || []);
    } catch (error) {
      console.error('Error fetching AI errors', error);
    }
  }, [user, supabase]);
  
  // Fetch optimization recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('optimization_recommendations')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations', error);
    }
  }, [user, supabase]);
  
  // Fetch insights
  const fetchInsights = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights', error);
    }
  }, [user, supabase]);
  
  // Fetch model comparison data
  const fetchModelComparison = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_comparison')
        .select('*');
        
      if (error) throw error;
      
      setModelComparison(data || []);
    } catch (error) {
      console.error('Error fetching model comparison data', error);
    }
  }, [supabase]);
  
  // Fetch usage trends
  const fetchUsageTrends = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_usage_trends')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true });
        
      if (error) throw error;
      
      setUsageTrends(data || []);
    } catch (error) {
      console.error('Error fetching usage trends', error);
    }
  }, [user, supabase]);
  
  // Fetch performance metrics
  const fetchPerformanceMetrics = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_performance_metrics')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setPerformanceMetrics(data || []);
    } catch (error) {
      console.error('Error fetching performance metrics', error);
    }
  }, [user, supabase]);
  
  // Handle job selection
  const handleJobSelect = useCallback((job: AIProcessingJob) => {
    setSelectedJob(job);
    fetchJobResults(job.id);
  }, [fetchJobResults]);
  
  // Handle job retry
  const handleRetryJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/ai/video-processing/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      toast({
        title: "Job Restarted","
        description: "Processing job has been queued for retry","
        variant: "success""
      });
      
      // Refresh jobs list
      fetchJobs();
    } catch (error) {
      console.error('Error retrying job', error);
      toast({
        title: "Error","
        description: "Failed to restart processing job","
        variant: "destructive""
      });
    }
  }, [fetchJobs, toast]);
  
  // Handle job cancellation
  const handleCancelJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/ai/video-processing/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      toast({
        title: "Job Cancelled","
        description: "Processing job has been cancelled","
        variant: "success""
      });
      
      // Refresh jobs list
      fetchJobs();
    } catch (error) {
      console.error('Error cancelling job', error);
      toast({
        title: "Error","
        description: "Failed to cancel processing job","
        variant: "destructive""
      });
    }
  }, [fetchJobs, toast]);
  
  // Handle error resolution
  const handleResolveError = useCallback(async (errorId: string, status: AIError['status']) => {
    try {
      const { error } = await supabase
        .from('ai_errors')
        .update({ status })
        .eq('id', errorId);
        
      if (error) throw error;
      
      // Update local state
      setErrors(prev => prev.map(err => 
        err.id === errorId ? { ...err, status } : err
      ));
      
      toast({
        title: "Error Updated","
        description: `Error status updated to ${status}`,
        variant: "success""
      });
    } catch (error) {
      console.error('Error updating error status', error);
      toast({
        title: "Error","
        description: "Failed to update error status","
        variant: "destructive""
      });
    }
  }, [supabase, toast]);
  
  // Handle recommendation implementation
  const handleImplementRecommendation = useCallback(async (recommendationId: string, implemented: boolean) => {
    try {
      const { error } = await supabase
        .from('optimization_recommendations')
        .update({ implemented })
        .eq('id', recommendationId);
        
      if (error) throw error;
      
      // Update local state
      setRecommendations(prev => prev.map(rec => 
        rec.id === recommendationId ? { ...rec, implemented } : rec
      ));
      
      toast({
        title: implemented ? "Recommendation Implemented" : "Recommendation Marked as Not Implemented","
        description: "Optimization recommendation status updated","
        variant: "success""
      });
    } catch (error) {
      console.error('Error updating recommendation status', error);
      toast({
        title: "Error","
        description: "Failed to update recommendation status","
        variant: "destructive""
      });
    }
  }, [supabase, toast]);
  
  // Handle settings update
  const handleSettingsUpdate = useCallback((newSettings: AISettings) => {
    setSettings(newSettings);
    setIsSettingsChanged(false);
    setTempSettings(null);
    
    toast({
      title: "Settings Updated","
      description: "AI processing settings have been updated","
      variant: "success""
    });
  }, [setSettings, toast]);
  
  // Handle settings change
  const handleSettingsChange = useCallback((partialSettings: Partial<AISettings>) => {
    setTempSettings(prev => ({
      ...(prev || settings),
      ...partialSettings
    }));
    setIsSettingsChanged(true);
  }, [settings]);
  
  // Handle export data
  const handleExportData = useCallback(async (type: 'jobs' | 'costs' | 'errors' | 'providers' | 'models' | 'all') => {
    try {
      setIsExporting(true);
      setIsExportDialogOpen(true);
      setExportProgress(0);
      
      let exportData;
      let filename;
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);
      
      switch (type) {
        case 'jobs':
          exportData = filteredJobs;
          filename = 'ai-processing-jobs';
          break;
        case 'costs':
          exportData = costData;
          filename = 'ai-processing-costs';
          break;
        case 'errors':
          exportData = filteredErrors;
          filename = 'ai-processing-errors';
          break;
        case 'providers':
          exportData = providers;
          filename = 'ai-providers';
          break;
        case 'models':
          exportData = models;
          filename = 'ai-models';
          break;
        case 'all':
          exportData = {
            jobs: filteredJobs,
            costs: costData,
            errors: filteredErrors,
            providers: providers,
            models: models,
            quotaUsage: quotaUsage,
            insights: insights,
            recommendations: recommendations,
            performanceMetrics: performanceMetrics
          };
          filename = 'ai-dashboard-export';
          break;
      }
      
      // Add timestamp to filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `${filename}-${timestamp}`;
      
      // Format based on selection
      let dataStr;
      let mimeType;
      let fileExtension;
      
      switch (exportFormat) {
        case 'csv':
          // Simple CSV conversion (in a real app would use a proper CSV library)
          if (Array.isArray(exportData)) {
            const headers = Object.keys(exportData[0] || {}).join(',');
            const rows = exportData.map(item => 
              Object.values(item).map(val => 
                typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val"
              ).join(',')
            );
            dataStr = [headers, ...rows].join('\n');
          } else {
            // For complex nested data, flatten or convert to multiple CSV files
            dataStr = JSON.stringify(exportData, null, 2); // Fallback to JSON
          }
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
          
        case 'excel':
          // In a real app, would use a library like exceljs or xlsx
          // For this example, we'll just use JSON as a placeholder
          dataStr = JSON.stringify(exportData, null, 2);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileExtension = 'xlsx';
          break;
          
        case 'json':
        default:
          dataStr = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
      }
      
      // Simulate delay for export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create download link
      const dataBlob = new Blob([dataStr], { type: mimeType });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${fileExtension}`;
      
      // Complete progress
      setExportProgress(100);
      clearInterval(progressInterval);
      
      // Delay download to show 100% completion
      setTimeout(() => {
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        setIsExporting(false);
        
        toast({
          title: "Export Complete","
          description: `Data has been exported to ${filename}.${fileExtension}`,
          variant: "success""
        });
      }, 500);
      
    } catch (error) {
      console.error('Error exporting data', error);
      toast({
        title: "Export Error","
        description: "Failed to export data","
        variant: "destructive""
      });
      setIsExporting(false);
    }
  }, [filteredJobs, costData, filteredErrors, providers, models, quotaUsage, insights, recommendations, performanceMetrics, toast, exportFormat]);
  
  // Initialize data fetching
  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchProviders();
      fetchModelMetrics();
      fetchCostData();
      fetchQuotaUsage();
      fetchErrors();
      fetchRecommendations();
      fetchInsights();
      fetchModelComparison();
      fetchUsageTrends();
      fetchPerformanceMetrics();
      initWebSocket();
    }
  }, [
    user, 
    fetchJobs, 
    fetchProviders, 
    fetchModelMetrics, 
    fetchCostData, 
    fetchQuotaUsage, 
    fetchErrors, 
    fetchRecommendations,
    fetchInsights,
    fetchModelComparison,
    fetchUsageTrends,
    fetchPerformanceMetrics,
    initWebSocket
  ]);
  
  // Update cost data when filters change
  useEffect(() => {
    if (user) {
      fetchCostData();
    }
  }, [user, fetchCostData, filters.dateRange]);
  
  // Initialize settings editor
  useEffect(() => {
    if (settings && !tempSettings) {
      setTempSettings(settings);
    }
  }, [settings, tempSettings]);
  
  // Format time duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours > 0 ? `${hours}h` : '',
      minutes > 0 ? `${minutes}m` : '',
      `${secs}s`
    ].filter(Boolean).join(' ');
  };
  
  // Calculate total cost
  const totalCost = useMemo(() => {
    return costData.reduce((sum, day) => sum + day.total, 0);
  }, [costData]);
  
  // Calculate cost breakdown by operation
  const costBreakdown = useMemo(() => {
    return costData.reduce((acc, day) => {
      acc.transcription += day.transcription;
      acc.sentiment += day.sentiment;
      acc.chapters += day.chapters;
      acc.speakerDiarization += day.speakerDiarization;
      acc.entities += day.entities;
      return acc;
    }, {
      transcription: 0,
      sentiment: 0,
      chapters: 0,
      speakerDiarization: 0,
      entities: 0
    });
  }, [costData]);
  
  // Calculate pie chart data for cost breakdown
  const costPieData = useMemo(() => {
    return [
      { name: 'Transcription', value: costBreakdown.transcription },
      { name: 'Sentiment', value: costBreakdown.sentiment },
      { name: 'Chapters', value: costBreakdown.chapters },
      { name: 'Speaker Diarization', value: costBreakdown.speakerDiarization },
      { name: 'Entities', value: costBreakdown.entities }
    ].filter(item => item.value > 0);
  }, [costBreakdown]);
  
  // Calculate job status counts
  const jobStatusCounts = useMemo(() => {
    return jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [jobs]);
  
  // Calculate error counts by status
  const errorStatusCounts = useMemo(() => {
    return errors.reduce((acc, error) => {
      acc[error.status] = (acc[error.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [errors]);
  
  // Calculate error counts by impact
  const errorImpactCounts = useMemo(() => {
    return errors.reduce((acc, error) => {
      acc[error.impact] = (acc[error.impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [errors]);
  
  // Calculate provider status counts
  const providerStatusCounts = useMemo(() => {
    return providers.reduce((acc, provider) => {
      acc[provider.status] = (acc[provider.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [providers]);
  
  // Calculate total savings from implemented recommendations
  const totalImplementedSavings = useMemo(() => {
    return recommendations
      .filter(rec => rec.implemented)
      .reduce((sum, rec) => sum + rec.estimatedSavings, 0);
  }, [recommendations]);
  
  // Calculate potential savings from unimplemented recommendations
  const totalPotentialSavings = useMemo(() => {
    return recommendations
      .filter(rec => !rec.implemented)
      .reduce((sum, rec) => sum + rec.estimatedSavings, 0);
  }, [recommendations]);
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
  
  // Status colors
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
      case 'operational':
      case 'resolved':
        return 'bg-green-500';
      case 'processing':
      case 'degraded':
      case 'investigating':
        return 'bg-amber-500';
      case 'failed':
      case 'outage':
      case 'new':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  // Impact colors
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'low':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-amber-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">"
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">"
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-28 rounded-lg" />"
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />"
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">"
        <Skeleton className="h-80 rounded-lg" />"
        <Skeleton className="h-80 rounded-lg" />"
      </div>
    </div>
  );
  
  return (
    <ErrorBoundary fallback={<div className="p-4">Error loading AI Dashboard</div>}>"
      <div className="flex flex-col space-y-4">"
        {/* Enhanced Navigation */}
        <EnhancedNavigation
          title="AI Management Dashboard""
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },"
            { title: "AI Management", href: pathname }"
          ]}
          actions={[
            {
              title: "New Processing Job","
              icon: "Plus","
              onClick: () => router.push("/dashboard/ai/new-job")"
            },
            {
              title: "Refresh Data","
              icon: "RefreshCw","
              onClick: () => {
                fetchJobs();
                fetchProviders();
                fetchModelMetrics();
                fetchCostData();
                fetchQuotaUsage();
                fetchErrors();
                fetchRecommendations();
                fetchInsights();
                fetchModelComparison();
                fetchUsageTrends();
                fetchPerformanceMetrics();
              }
            }
          ]}
          relatedFeatures={[
            { title: "AI Video Recording", href: "/dashboard/ai/video-recording" },"
            { title: "AI Assistant", href: "/dashboard/ai/assistant" },"
            { title: "AI Content Studio", href: "/dashboard/ai/content-studio" }"
          ]}
        />
        
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-4">"
          {/* Contextual sidebar on desktop */}
          {isDesktop && (
            <div className="w-64 shrink-0">"
              <ContextualSidebar
                categories={[
                  {
                    title: "AI Management","
                    items: [
                      { title: "Dashboard", href: "/dashboard/ai", icon: "LayoutDashboard" },"
                      { title: "Processing Jobs", href: "/dashboard/ai/jobs", icon: "ListChecks" },"
                      { title: "Cost Analytics", href: "/dashboard/ai/costs", icon: "BarChart" },"
                      { title: "Provider Status", href: "/dashboard/ai/providers", icon: "Server" },"
                      { title: "Error Reports", href: "/dashboard/ai/errors", icon: "AlertTriangle" },"
                      { title: "Settings", href: "/dashboard/ai/settings", icon: "Settings" }"
                    ]
                  },
                  {
                    title: "AI Features","
                    items: [
                      { title: "Video Recording", href: "/dashboard/ai/video-recording", icon: "Video" },"
                      { title: "Content Studio", href: "/dashboard/ai/content-studio", icon: "Palette" },"
                      { title: "AI Assistant", href: "/dashboard/ai/assistant", icon: "Zap" },"
                      { title: "Transcription", href: "/dashboard/ai/transcription", icon: "FileText" },"
                      { title: "Image Generation", href: "/dashboard/ai/images", icon: "Image" }"
                    ]
                  }
                ]}
                favorites={[
                  { title: "Processing Jobs", href: "/dashboard/ai/jobs", icon: "ListChecks" },"
                  { title: "Cost Analytics", href: "/dashboard/ai/costs", icon: "BarChart" },"
                  { title: "Video Recording", href: "/dashboard/ai/video-recording", icon: "Video" }"
                ]}
                recentlyUsed={[
                  { title: "AI Assistant", href: "/dashboard/ai/assistant", icon: "Zap", timestamp: new Date().toISOString() },"
                  { title: "Content Studio", href: "/dashboard/ai/content-studio", icon: "Palette", timestamp: new Date(Date.now() - 3600000).toISOString() }"
                ]}
              />
            </div>
          )}
          
          {/* Main dashboard area */}
          <div className="flex-1 space-y-4">"
            {/* Dashboard header with filters and actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-lg border">"
              <div>
                <h1 className="text-2xl font-bold">AI Management Dashboard</h1>"
                <p className="text-muted-foreground">Monitor and manage AI processing jobs, costs, and performance</p>"
              </div>
              
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">"
                <div className="relative">"
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />"
                  <Input
                    type="search""
                    placeholder="Search jobs...""
                    className="pl-8 w-full md:w-[200px]""
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                <Button
                  variant="outline""
                  size="sm""
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Toggle filters""
                >
                  <Filter className="h-4 w-4 mr-2" />"
                  Filters
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">"
                      <Download className="h-4 w-4 mr-2" />"
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">"
                    <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
                      Configure Export...
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExportData('jobs')}>
                      Processing Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportData('costs')}>
                      Cost Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportData('errors')}>
                      Error Reports
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportData('providers')}>
                      Provider Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportData('models')}>
                      Model Metrics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportData('all')}>
                      All Dashboard Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="outline""
                  size="sm""
                  onClick={() => setActiveTab("settings")}"
                  aria-label="Settings""
                >
                  <Settings className="h-4 w-4" />"
                </Button>
              </div>
            </div>
            
            {/* WebSocket connection status */}
            {!wsStatus.connected && (
              <Alert variant="warning">"
                <AlertTitle className="flex items-center gap-2">"
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>"
                  Disconnected from real-time updates
                </AlertTitle>
                <AlertDescription>
                  Attempting to reconnect... (Attempt {wsStatus.reconnectAttempts + 1})
                </AlertDescription>
              </Alert>
            )}
            
            {/* Filters panel (collapsible) */}
            {showFilters && (
              <Card>
                <CardHeader className="pb-3">"
                  <div className="flex items-center justify-between">"
                    <CardTitle>Filters</CardTitle>
                    <Button
                      variant="ghost""
                      size="sm""
                      onClick={() => setShowFilters(false)}
                      aria-label="Close filters""
                    >
                      <X className="h-4 w-4" />"
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">"
                    <div className="space-y-2">"
                      <Label htmlFor="date-range">Date Range</Label>"
                      <div className="flex gap-2">"
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline""
                              className="w-full justify-start text-left font-normal""
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />"
                              {filters.dateRange.from ? (
                                format(filters.dateRange.from, "PPP")"
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">"
                            <Calendar
                              mode="single""
                              selected={filters.dateRange.from}
                              onSelect={(date) => 
                                setFilters(prev => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, from: date }
                                }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline""
                              className="w-full justify-start text-left font-normal""
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />"
                              {filters.dateRange.to ? (
                                format(filters.dateRange.to, "PPP")"
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">"
                            <Calendar
                              mode="single""
                              selected={filters.dateRange.to}
                              onSelect={(date) => 
                                setFilters(prev => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, to: date }
                                }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">"
                      <Label htmlFor="status-filter">Status</Label>"
                      <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) => 
                          setFilters(prev => ({
                            ...prev,
                            status: value as typeof filters.status
                          }))
                        }
                      >
                        <SelectTrigger id="status-filter">"
                          <SelectValue placeholder="Select status" />"
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>"
                          <SelectItem value="queued">Queued</SelectItem>"
                          <SelectItem value="processing">Processing</SelectItem>"
                          <SelectItem value="completed">Completed</SelectItem>"
                          <SelectItem value="failed">Failed</SelectItem>"
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">"
                      <Label htmlFor="provider-filter">Provider</Label>"
                      <Select
                        value={filters.provider || ''}
                        onValueChange={(value) => 
                          setFilters(prev => ({
                            ...prev,
                            provider: value
                          }))
                        }
                      >
                        <SelectTrigger id="provider-filter">"
                          <SelectValue placeholder="Select provider" />"
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Providers</SelectItem>"
                          <SelectItem value="assemblyai">AssemblyAI</SelectItem>"
                          <SelectItem value="openai">OpenAI</SelectItem>"
                          <SelectItem value="deepgram">Deepgram</SelectItem>"
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">"
                      <Label htmlFor="error-impact-filter">Error Impact</Label>"
                      <Select
                        value={filters.errorImpact || 'all'}
                        onValueChange={(value) => 
                          setFilters(prev => ({
                            ...prev,
                            errorImpact: value as typeof filters.errorImpact
                          }))
                        }
                      >
                        <SelectTrigger id="error-impact-filter">"
                          <SelectValue placeholder="Select impact" />"
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Impacts</SelectItem>"
                          <SelectItem value="low">Low</SelectItem>"
                          <SelectItem value="medium">Medium</SelectItem>"
                          <SelectItem value="high">High</SelectItem>"
                          <SelectItem value="critical">Critical</SelectItem>"
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">"
                      <Label htmlFor="error-status-filter">Error Status</Label>"
                      <Select
                        value={filters.errorStatus || 'all'}
                        onValueChange={(value) => 
                          setFilters(prev => ({
                            ...prev,
                            errorStatus: value as typeof filters.errorStatus
                          }))
                        }
                      >
                        <SelectTrigger id="error-status-filter">"
                          <SelectValue placeholder="Select status" />"
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>"
                          <SelectItem value="new">New</SelectItem>"
                          <SelectItem value="investigating">Investigating</SelectItem>"
                          <SelectItem value="resolved">Resolved</SelectItem>"
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">"
                  <Button
                    variant="outline""
                    onClick={() => setFilters({
                      dateRange: {
                        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        to: new Date()
                      },
                      status: 'all',
                      search: '',
                      errorImpact: 'all',
                      errorStatus: 'all'
                    })}
                  >
                    Reset Filters
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Dashboard tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">"
              <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6">"
                <TabsTrigger value="overview">Overview</TabsTrigger>"
                <TabsTrigger value="jobs">Jobs</TabsTrigger>"
                <TabsTrigger value="costs">Costs</TabsTrigger>"
                <TabsTrigger value="providers">Providers</TabsTrigger>"
                <TabsTrigger value="errors">Errors</TabsTrigger>"
                <TabsTrigger value="settings">Settings</TabsTrigger>"
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">"
                {isLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">"
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">"
                          <CardTitle className="text-sm font-medium">"
                            Total Processing Jobs
                          </CardTitle>
                          <ListChecks className="h-4 w-4 text-muted-foreground" />"
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{jobs.length}</div>"
                          <p className="text-xs text-muted-foreground">"
                            {jobStatusCounts.completed || 0} completed, {jobStatusCounts.failed || 0} failed
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">"
                          <CardTitle className="text-sm font-medium">"
                            Total Cost (30 days)
                          </CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />"
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>"
                          <p className="text-xs text-muted-foreground">"
                            {quotaUsage ? `${((quotaUsage.used / quotaUsage.total) * 100).toFixed(1)}% of quota used` : 'Loading quota...'}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">"
                          <CardTitle className="text-sm font-medium">"
                            Provider Status
                          </CardTitle>
                          <Activity className="h-4 w-4 text-muted-foreground" />"
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">"
                            {providers.filter(p => p.status === 'operational').length}/{providers.length}
                          </div>
                          <p className="text-xs text-muted-foreground">"
                            Providers operational
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Insights */}
                    {insights.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">"
                          <CardTitle>AI Insights</CardTitle>
                          <CardDescription>
                            Automatically generated insights based on your AI usage
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">"
                            {insights.slice(0, 3).map((insight) => (
                              <Alert
                                key={insight.id}
                                variant={
                                  insight.severity === 'critical' ? 'destructive' :
                                  insight.severity === 'warning' ? 'warning' : 'default'
                                }
                              >
                                <div className="flex items-start justify-between">"
                                  <div>
                                    <AlertTitle>{insight.title}</AlertTitle>
                                    <AlertDescription>{insight.description}</AlertDescription>
                                    
                                    {insight.metric && insight.value !== undefined && (
                                      <div className="mt-2 text-sm">"
                                        <span className="font-medium">{insight.metric}:</span>{' '}"
                                        {insight.value}
                                        {insight.change && (
                                          <Badge variant={insight.change > 0 ? 'success' : 'destructive'} className="ml-2">"
                                            {insight.change > 0 ? '+' : ''}{insight.change}%
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {insight.actions && insight.actions.length > 0 && (
                                    <div className="flex gap-2">"
                                      {insight.actions.map((action, idx) => (
                                        <Button key={idx} size="sm" variant="outline">"
                                          {action.label}
                                        </Button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </Alert>
                            ))}
                          </div>
                        </CardContent>
                        {insights.length > 3 && (
                          <CardFooter>
                            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/ai/insights")}>"
                              View All Insights
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    )}
                    
                    {/* Recent jobs */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Processing Jobs</CardTitle>
                        <CardDescription>
                          Latest AI processing jobs and their status
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job ID</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Progress</TableHead>
                              <TableHead>Provider</TableHead>
                              <TableHead className="text-right">Actions</TableHead>"
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {jobs.slice(0, 5).map((job) => (
                              <TableRow key={job.id} onClick={() => handleJobSelect(job)} className="cursor-pointer">"
                                <TableCell className="font-medium">"
                                  {job.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  {new Date(job.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">"
                                    <span className={`h-2 w-2 rounded-full ${getStatusColor(job.status)}`}></span>
                                    <Badge variant={
                                      job.status === 'completed' ? 'success' :
                                      job.status === 'failed' ? 'destructive' :
                                      job.status === 'processing' ? 'default' : 'outline'
                                    }>
                                      {job.status}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">"
                                    <Progress value={job.progress} className="h-2 w-[60px]" />"
                                    <span>{job.progress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {job.options.preferredProvider || 'auto'}
                                </TableCell>
                                <TableCell className="text-right">"
                                  <DropdownMenu>
                                    