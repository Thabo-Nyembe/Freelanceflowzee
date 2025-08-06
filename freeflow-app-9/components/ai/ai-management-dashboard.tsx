/**
 * @file AI Management Dashboard
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
  CalendarIcon,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Filter,
  Info,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  X,
  DollarSign,
  Activity,
  ListChecks
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
  Legend, ResponsiveContainer, Cell
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
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  implemented: boolean;
}

/**
 * AI Management Dashboard Component
 * @returns React component
 */
export function AIManagementDashboard() {
  // Router and navigation
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  
  // State management
  const [activeTab, setActiveTab] = useState("overview");
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
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date()
    },
    status: 'all',
    search: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [settings, setSettings] = useLocalStorage<AISettings>("ai-dashboard-settings", {
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
    cacheTTL: 86400 // 24 hours in seconds
  });
  
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
              title: "Processing Complete",
              description: `Job ${data.jobId.substring(0, 8)}... has been completed successfully.`,
              variant: "success"
            });
            
            // Refresh jobs list
            fetchJobs();
            break;
            
          case 'processing_error':
            // Show toast notification
            toast({
              title: "Processing Error",
              description: data.error || "An unknown error occurred",
              variant: "destructive"
            });
            
            // Add to errors list
            setErrors(prev => [
              {
                id: `error-${Date.now()}`,
                timestamp: new Date().toISOString(),
                jobId: data.jobId,
                errorCode: 'PROCESSING_ERROR',
                message: data.error || "An unknown error occurred",
                status: 'new',
                impact: 'medium'
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
  }, [user, toast]);
  
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
        title: "Error",
        description: "Failed to fetch processing jobs",
        variant: "destructive"
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
      
      setQuotaUsage({
        userId: user.id,
        used: data.used_quota,
        total: data.total_quota,
        resetDate: data.reset_date,
        tier: data.tier,
        history: historyData.map(item => ({
          date: item.date,
          used: item.used_quota
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
        title: "Job Restarted",
        description: "Processing job has been queued for retry",
        variant: "success"
      });
      
      // Refresh jobs list
      fetchJobs();
    } catch (error) {
      console.error('Error retrying job', error);
      toast({
        title: "Error",
        description: "Failed to restart processing job",
        variant: "destructive"
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
        title: "Job Cancelled",
        description: "Processing job has been cancelled",
        variant: "success"
      });
      
      // Refresh jobs list
      fetchJobs();
    } catch (error) {
      console.error('Error cancelling job', error);
      toast({
        title: "Error",
        description: "Failed to cancel processing job",
        variant: "destructive"
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
        title: "Error Updated",
        description: `Error status updated to ${status}`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error updating error status', error);
      toast({
        title: "Error",
        description: "Failed to update error status",
        variant: "destructive"
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
        title: implemented ? "Recommendation Implemented" : "Recommendation Marked as Not Implemented",
        description: "Optimization recommendation status updated",
        variant: "success"
      });
    } catch (error) {
      console.error('Error updating recommendation status', error);
      toast({
        title: "Error",
        description: "Failed to update recommendation status",
        variant: "destructive"
      });
    }
  }, [supabase, toast]);
  
  // Handle settings update
  const handleSettingsUpdate = useCallback((newSettings: Partial<AISettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
    
    toast({
      title: "Settings Updated",
      description: "AI processing settings have been updated",
      variant: "success"
    });
  }, [setSettings, toast]);
  
  // Handle export data
  const handleExportData = useCallback(async (type: 'jobs' | 'costs' | 'errors' | 'all') => {
    try {
      setIsExporting(true);
      
      let exportData;
      let filename;
      
      switch (type) {
        case 'jobs':
          exportData = filteredJobs;
          filename = 'ai-processing-jobs.json';
          break;
        case 'costs':
          exportData = costData;
          filename = 'ai-processing-costs.json';
          break;
        case 'errors':
          exportData = errors;
          filename = 'ai-processing-errors.json';
          break;
        case 'all':
          exportData = {
            jobs: filteredJobs,
            costs: costData,
            errors: errors,
            providers: providers,
            models: models,
            quotaUsage: quotaUsage
          };
          filename = 'ai-dashboard-export.json';
          break;
      }
      
      // Create download link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Data has been exported to ${filename}`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error exporting data', error);
      toast({
        title: "Export Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [filteredJobs, costData, errors, providers, models, quotaUsage, toast]);
  
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
    initWebSocket
  ]);
  
  // Update cost data when filters change
  useEffect(() => {
    if (user) {
      fetchCostData();
    }
  }, [user, fetchCostData, filters.dateRange]);
  
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
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {jobResults.analytics.topMoments.map((moment, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-start justify-between p-2 border rounded-md"
                                            >
                                              <div className="text-sm">
                                                <span className="font-medium">
                                                  {formatDuration(moment.timestamp)}
                                                </span>{" "}
                                                – {moment.description}
                                              </div>
                                              <Badge variant="outline" className="text-xs">
                                                {moment.score.toFixed(1)}
                                              </Badge>
                                            </div>
                                          ))}
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
  
  return (
    <ErrorBoundary fallback={<div className="p-4">Error loading AI Management Dashboard</div>}>
      <div className="flex flex-col space-y-4">
        {/* Enhanced Navigation */}
        <EnhancedNavigation
          title="AI Management Dashboard"
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "AI Management", href: pathname }
          ]}
          actions={[
            {
              title: "New Processing Job",
              icon: "Plus",
              onClick: () => router.push("/dashboard/ai/new-job")
            },
            {
              title: "Refresh Data",
              icon: "RefreshCw",
              onClick: () => {
                fetchJobs();
                fetchProviders();
                fetchModelMetrics();
                fetchCostData();
                fetchQuotaUsage();
                fetchErrors();
                fetchRecommendations();
              }
            }
          ]}
          relatedFeatures={[
            { title: "AI Video Recording", href: "/dashboard/ai/video-recording" },
            { title: "AI Assistant", href: "/dashboard/ai/assistant" },
            { title: "AI Content Studio", href: "/dashboard/ai/content-studio" }
          ]}
        />
        
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Contextual sidebar on desktop */}
export default AIManagementDashboard;

          {isDesktop && (
            <div className="w-64 shrink-0">
              <ContextualSidebar
                categories={[
                  {
                    title: "AI Management",
                    items: [
                      { title: "Dashboard", href: "/dashboard/ai", icon: "LayoutDashboard" },
                      { title: "Processing Jobs", href: "/dashboard/ai/jobs", icon: "ListChecks" },
                      { title: "Cost Analytics", href: "/dashboard/ai/costs", icon: "BarChart" },
                      { title: "Provider Status", href: "/dashboard/ai/providers", icon: "Server" },
                      { title: "Error Reports", href: "/dashboard/ai/errors", icon: "AlertTriangle" },
                      { title: "Settings", href: "/dashboard/ai/settings", icon: "Settings" }
                    ]
                  },
                  {
                    title: "AI Features",
                    items: [
                      { title: "Video Recording", href: "/dashboard/ai/video-recording", icon: "Video" },
                      { title: "Content Studio", href: "/dashboard/ai/content-studio", icon: "Palette" },
                      { title: "AI Assistant", href: "/dashboard/ai/assistant", icon: "Zap" },
                      { title: "Transcription", href: "/dashboard/ai/transcription", icon: "FileText" },
                      { title: "Image Generation", href: "/dashboard/ai/images", icon: "Image" }
                    ]
                  }
                ]}
                favorites={[
                  { title: "Processing Jobs", href: "/dashboard/ai/jobs", icon: "ListChecks" },
                  { title: "Cost Analytics", href: "/dashboard/ai/costs", icon: "BarChart" },
                  { title: "Video Recording", href: "/dashboard/ai/video-recording", icon: "Video" }
                ]}
                recentlyUsed={[
                  { title: "AI Assistant", href: "/dashboard/ai/assistant", icon: "Zap", timestamp: new Date().toISOString() },
                  { title: "Content Studio", href: "/dashboard/ai/content-studio", icon: "Palette", timestamp: new Date(Date.now() - 3600000).toISOString() }
                ]}
              />
            </div>
          )}
          
          {/* Main dashboard area */}
          <div className="flex-1 space-y-4">
            {/* Dashboard header with filters and actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-lg border">
              <div>
                <h1 className="text-2xl font-bold">AI Management Dashboard</h1>
                <p className="text-muted-foreground">Monitor and manage AI processing jobs, costs, and performance</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search jobs..."
                    className="pl-8 w-full md:w-[200px]"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Toggle filters"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Data</DropdownMenuLabel>
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
                    <DropdownMenuItem onClick={() => handleExportData('all')}>
                      All Dashboard Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Filters panel (collapsible) */}
            {showFilters && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Filters</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      aria-label="Close filters"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-range">Date Range</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.dateRange.from ? (
                                format(filters.dateRange.from, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
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
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.dateRange.to ? (
                                format(filters.dateRange.to, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="status-filter">Status</Label>
                      <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) => 
                          setFilters(prev => ({
                            ...prev,
                            status: value as typeof filters.status
                          }))
                        }
                      >
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="queued">Queued</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="provider-filter">Provider</Label>
                      <Select
                        value={filters.provider || ''}
                        onValueChange={(value) => 
                          setFilters(prev => ({
                            ...prev,
                            provider: value
                          }))
                        }
                      >
                        <SelectTrigger id="provider-filter">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Providers</SelectItem>
                          <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="deepgram">Deepgram</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* WebSocket connection status */}
            {!wsStatus.connected && (
              <Alert variant="warning">
                <AlertTitle className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Disconnected from real-time updates
                </AlertTitle>
                <AlertDescription>
                  Attempting to reconnect... (Attempt {wsStatus.reconnectAttempts + 1})
                </AlertDescription>
              </Alert>
            )}
            
            {/* Dashboard tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="providers">Providers</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {isLoading ? (
                  renderSkeleton()
                ) : (
                  <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Processing Jobs
                          </CardTitle>
                          <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{jobs.length}</div>
                          <p className="text-xs text-muted-foreground">
                            {jobStatusCounts.completed || 0} completed, {jobStatusCounts.failed || 0} failed
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Total Cost (30 days)
                          </CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
                          <p className="text-xs text-muted-foreground">
                            {quotaUsage ? `${((quotaUsage.used / quotaUsage.total) * 100).toFixed(1)}% of quota used` : 'Loading quota...'}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Provider Status
                          </CardTitle>
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {providers.filter(p => p.status === 'operational').length}/{providers.length}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Providers operational
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
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
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {jobs.slice(0, 5).map((job) => (
                              <TableRow key={job.id} onClick={() => handleJobSelect(job)} className="cursor-pointer">
                                <TableCell className="font-medium">
                                  {job.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  {new Date(job.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={
                                    job.status === 'completed' ? 'success' :
                                    job.status === 'failed' ? 'destructive' :
                                    job.status === 'processing' ? 'default' : 'outline'
                                  }>
                                    {job.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={job.progress} className="h-2 w-[60px]" />
                                    <span>{job.progress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {job.options.preferredProvider || 'auto'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleJobSelect(job)}>
                                        View Details
                                      </DropdownMenuItem>
                                      {job.status === 'failed' && (
                                        <DropdownMenuItem onClick={() => handleRetryJob(job.id)}>
                                          Retry Job
                                        </DropdownMenuItem>
                                      )}
                                      {(job.status === 'queued' || job.status === 'processing') && (
                                        <DropdownMenuItem onClick={() => handleCancelJob(job.id)}>
                                          Cancel Job
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                            {jobs.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                  No processing jobs found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("jobs")}>
                          View All Jobs
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/ai/new-job")}>
                          New Job
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {/* Charts row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cost over time chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Cost Over Time</CardTitle>
                          <CardDescription>
                            Daily AI processing costs for the last 30 days
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={costData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                                </linearGradient>
                              </defs>
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                              />
                              <YAxis 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                              />
                              <CartesianGrid strokeDasharray="3 3" />
                              <RechartsTooltip 
                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                labelFormatter={(label) => {
                                  const date = new Date(label);
                                  return date.toLocaleDateString();
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="total" 
                                stroke="#8884d8" 
                                fillOpacity={1} 
                                fill="url(#colorTotal)" 
                                name="Total Cost"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      
                      {/* Cost breakdown chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Cost Breakdown</CardTitle>
                          <CardDescription>
                            Cost distribution by operation type
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={costPieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {costPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                formatter={(value: number) => `$${value.toFixed(2)}`}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Optimization Recommendations</CardTitle>
                        <CardDescription>
                          Suggestions to improve efficiency and reduce costs
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recommendations.slice(0, 3).map((rec) => (
                            <div key={rec.id} className="flex items-start justify-between border-b pb-4">
                              <div>
                                <h4 className="font-medium">{rec.title}</h4>
                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-green-600 bg-green-50">
                                    ${rec.estimatedSavings.toFixed(2)} savings
                                  </Badge>
                                  <Badge variant="outline" className={cn(
                                    rec.difficulty === 'easy' ? 'text-green-600 bg-green-50' :
                                    rec.difficulty === 'medium' ? 'text-amber-600 bg-amber-50' :
                                    'text-red-600 bg-red-50'
                                  )}>
                                    {rec.difficulty} implementation
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant={rec.implemented ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleImplementRecommendation(rec.id, !rec.implemented)}
                                >
                                  {rec.implemented ? "Implemented" : "Implement"}
                                </Button>
                              </div>
                            </div>
                          ))}
                          {recommendations.length === 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              No recommendations available at this time
                            </div>
                          )}
                        </div>
                      </CardContent>
                      {recommendations.length > 3 && (
                        <CardFooter>
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab("costs")}>
                            View All Recommendations
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </>
                )}
              </TabsContent>
              
              {/* Jobs Tab */}
              <TabsContent value="jobs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Jobs</CardTitle>
                    <CardDescription>
                      All AI processing jobs and their details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job ID</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Progress</TableHead>
                              <TableHead>Provider</TableHead>
                              <TableHead>Features</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredJobs.map((job) => (
                              <TableRow key={job.id} onClick={() => handleJobSelect(job)} className="cursor-pointer">
                                <TableCell className="font-medium">
                                  {job.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  {new Date(job.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={
                                    job.status === 'completed' ? 'success' :
                                    job.status === 'failed' ? 'destructive' :
                                    job.status === 'processing' ? 'default' : 'outline'
                                  }>
                                    {job.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={job.progress} className="h-2 w-[60px]" />
                                    <span>{job.progress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {job.options.preferredProvider || 'auto'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {job.options.transcription && (
                                      <Badge variant="outline" className="text-xs">Transcription</Badge>
                                    )}
                                    {job.options.sentiment && (
                                      <Badge variant="outline" className="text-xs">Sentiment</Badge>
                                    )}
                                    {job.options.chapters && (
                                      <Badge variant="outline" className="text-xs">Chapters</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleJobSelect(job)}>
                                        View Details
                                      </DropdownMenuItem>
                                      {job.status === 'failed' && (
                                        <DropdownMenuItem onClick={() => handleRetryJob(job.id)}>
                                          Retry Job
                                        </DropdownMenuItem>
                                      )}
                                      {(job.status === 'queued' || job.status === 'processing') && (
                                        <DropdownMenuItem onClick={() => handleCancelJob(job.id)}>
                                          Cancel Job
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                            {filteredJobs.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                  No processing jobs found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Job details dialog */}
                {selectedJob && (
                  <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Job Details: {selectedJob.id.substring(0, 8)}...</DialogTitle>
                        <DialogDescription>
                          Processing job details and results
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Job info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium">Status</h4>
                            <Badge variant={
                              selectedJob.status === 'completed' ? 'success' :
                              selectedJob.status === 'failed' ? 'destructive' :
                              selectedJob.status === 'processing' ? 'default' : 'outline'
                            } className="mt-1">
                              {selectedJob.status}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Created</h4>
                            <p className="text-sm">{new Date(selectedJob.created_at).toLocaleString()}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Video Path</h4>
                            <p className="text-sm truncate">{selectedJob.video_path}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Provider</h4>
                            <p className="text-sm">{selectedJob.options.preferredProvider || 'auto'}</p>
                          </div>
                        </div>
                        
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <h4 className="text-sm font-medium">Progress</h4>
                            <span className="text-sm">{selectedJob.progress}%</span>
                          </div>
                          <Progress value={selectedJob.progress} className="h-2" />
                        </div>
                        
                        {/* Options */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Processing Options</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.options.transcription && (
                              <Badge variant="outline">Transcription</Badge>
                            )}
                            {selectedJob.options.sentiment && (
                              <Badge variant="outline">Sentiment</Badge>
                            )}
                            {selectedJob.options.chapters && (
                              <Badge variant="outline">Chapters</Badge>
                            )}
                            {selectedJob.options.speakerDiarization && (
                              <Badge variant="outline">Speaker Diarization</Badge>
                            )}
                            {selectedJob.options.keywords && (
                              <Badge variant="outline">Keywords</Badge>
                            )}
                            {selectedJob.options.entities && (
                              <Badge variant="outline">Entities</Badge>
                            )}
                            {selectedJob.options.analytics && (
                              <Badge variant="outline">Analytics</Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Error message */}
                        {selectedJob.error && (
                          <Alert variant="destructive">
                            <AlertTitle>Processing Error</AlertTitle>
                            <AlertDescription>{selectedJob.error}</AlertDescription>
                          </Alert>
                        )}
                        
                        {/* Results tabs */}
                        {jobResults && (
                          <Tabs defaultValue="transcription" className="mt-4">
                            <TabsList className="grid grid-cols-3">
                              <TabsTrigger value="transcription">Transcription</TabsTrigger>
                              <TabsTrigger value="chapters">Chapters</TabsTrigger>
                              <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="transcription" className="mt-2">
                              <Card>
                                <CardContent className="pt-4">
                                  <ScrollArea className="h-[300px]">
                                    {jobResults.transcription?.length > 0 ? (
                                      <div className="space-y-2">
                                        {jobResults.transcription.map((segment) => (
                                          <div key={segment.id} className="p-2 border rounded-md">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                              <span>
                                                {formatDuration(segment.startTime)} - {formatDuration(segment.endTime)}
                                              </span>
                                              {segment.speaker && (
                                                <span>Speaker: {segment.speaker}</span>
                                              )}
                                            </div>
                                            <p>{segment.text}</p>
                                            {segment.sentiment && (
                                              <Badge variant="outline" className={cn(
                                                "mt-1",
                                                segment.sentiment === 'positive' ? "text-green-600 bg-green-50" :
                                                segment.sentiment === 'negative' ? "text-red-600 bg-red-50" :
                                                "text-blue-600 bg-blue-50"
                                              )}>
                                                {segment.sentiment}
                                              </Badge>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-muted-foreground">
                                        No transcription data available
                                      </div>
                                    )}
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            
                            <TabsContent value="chapters" className="mt-2">
                              <Card>
                                <CardContent className="pt-4">
                                  <ScrollArea className="h-[300px]">
                                    {jobResults.chapters?.length > 0 ? (
                                      <div className="space-y-4">
                                        {jobResults.chapters.map((chapter) => (
                                          <div key={chapter.id} className="p-3 border rounded-md">
                                            <h4 className="font-medium">{chapter.title}</h4>
                                            <div className="text-xs text-muted-foreground mb-2">
                                              {formatDuration(chapter.startTime)} - {formatDuration(chapter.endTime)}
                                            </div>
                                            <p className="text-sm">{chapter.summary}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {chapter.keyTopics.map((topic, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                  {topic}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-muted-foreground">
                                        No chapter data available
                                      </div>
                                    )}
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            
                            <TabsContent value="analytics" className="mt-2">
                              <Card>
                                <CardContent className="pt-4">
                                  {jobResults.analytics ? (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium">Total Views</h4>
                                          <p className="text-2xl font-bold">{jobResults.analytics.totalViews}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium">Unique Viewers</h4>
                                          <p className="text-2xl font-bold">{jobResults.analytics.uniqueViewers}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium">Avg. Watch Time</h4>
                                          <p className="text-2xl font-bold">{formatDuration(jobResults.analytics.averageWatchTime)}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium">Completion Rate</h4>
                                          <p className="text-2xl font-bold">{jobResults.analytics.completionRate.toFixed(1)}%</p>
                                        </div>
                                      </div>
                                      
                                      <div className="h-[200px]">
                                        <h4 className="text-sm font-medium mb-2">Engagement Over Time</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                          <LineChart
                                            data={jobResults.analytics.heatmapData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                          >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                              dataKey="timestamp" 
                                              tickFormatter={(value) => formatDuration(value)}
                                            />
                                            <YAxis />
                                            <RechartsTooltip 
                                              formatter={(value: number) => `${value.toFixed(1)}%`}
                                              labelFormatter={(value) => `Time: ${formatDuration(Number(value))}`}
                                            />
                                            <Line 
                                              type="monotone" 
                                              dataKey="engagement" 
                                              stroke="#8884d8" 
                                              name="Engagement"
                                            />
                                          </LineChart>
                                        </ResponsiveContainer>
                                      </div>
                                      
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">Top Moments</h4>
                                        <div className="space-y-2">
                                          {jobResults.analytics.topMoments.map((moment,
