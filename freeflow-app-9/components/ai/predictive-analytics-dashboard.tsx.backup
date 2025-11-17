import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, Scatter, ScatterChart, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";"
import { Button } from "@/components/ui/button";"
import { Badge } from "@/components/ui/badge";"
import { Progress } from "@/components/ui/progress";"
import { Switch } from "@/components/ui/switch";"
import { Slider } from "@/components/ui/slider";"
import { Input } from "@/components/ui/input";"
import { Label } from "@/components/ui/label";"
import { Separator } from "@/components/ui/separator";"
import { ScrollArea } from "@/components/ui/scroll-area";"
import { Skeleton } from "@/components/ui/skeleton";"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";"
import { Checkbox } from "@/components/ui/checkbox";"
import { toast } from "@/components/ui/use-toast";"
import { useMediaQuery } from "@/hooks/use-media-query";"
import { cn } from "@/lib/utils";"

// Icons
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart2,
  BarChart3,
  Battery,
  BellRing,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Cloud,
  CreditCard,
  Database,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  HelpCircle,
  Info,
  LineChart as LineChartIcon,
  Loader2,
  MoreHorizontal,
  Percent,
  PieChart as PieChartIcon,
  RefreshCcw,
  Save,
  Search,
  Server,
  Settings,
  Share2,
  Shield,
  Sliders,
  Smartphone,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  Zap,
  AlertCircle,
  Activity,
  BarChartHorizontal,
  CircuitBoard,
  Cpu,
  Gauge,
  Layers,
  Maximize2,
  Minimize2,
  MonitorSmartphone,
  Network,
  Power,
  Repeat,
  RotateCcw,
  Scale,
  Target,
  Terminal,
  Thermometer,
  Timer,
  Wallet,
  Waves,
  X,
} from "lucide-react";"

// Types from our predictive analytics system
import {
  CostMetricType,
  PerformanceMetricType,
  OptimizationStrategyType,
  QueuePriority,
  MLModelType,
  TimeWindow,
  AlertType,
  AlertSeverity,
  CostAnomalyResult,
  ProviderPerformanceScore,
  QueueMetrics,
  OptimizationResult,
  MLModelEvaluationResult,
  SystemHealthMetrics,
  PredictionResult,
  DashboardMetrics
} from '@/lib/ai/predictive-analytics-system';

// AI Provider types
import { AIProvider, AIModelType } from '@/lib/ai/integrated-ai-system';

// WebSocket hook
import { useWebSocket } from '@/hooks/use-websocket';

// Export utilities
import { exportToCSV, exportToPDF, exportToExcel } from '@/lib/export-utils';

// Date formatting
import { format, subDays, subHours, subMinutes, parseISO, formatDistanceToNow } from 'date-fns';

// Color utilities
import { generateGradient, getColorByValue, getColorByStatus } from '@/lib/color-utils';

// Chart themes
import { lightTheme, darkTheme } from '@/lib/chart-themes';

// Types for component props and state
interface PredictiveAnalyticsDashboardProps {
  initialData?: DashboardMetrics;
  className?: string;
  isEmbedded?: boolean;
  refreshInterval?: number; // in milliseconds
  defaultTimeWindow?: TimeWindow;
  defaultTab?: string;
  onExport?: (data: any, format: 'csv' | 'pdf' | 'excel') => void;
  onAlert?: (alert: any) => void;
  onOptimizationStart?: (strategy: OptimizationStrategyType) => void;
  onOptimizationComplete?: (result: OptimizationResult) => void;
}

interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar' | 'radialBar';
  dataKey: string;
  visible: boolean;
  position: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

interface DashboardConfig {
  layout: {
    [key: string]: ChartConfig[];
  };
  refreshInterval: number;
  defaultTimeWindow: TimeWindow;
  defaultTab: string;
  theme: 'light' | 'dark' | 'system';
  alertsEnabled: boolean;
  autoOptimizationEnabled: boolean;
  exportFormats: ('csv' | 'pdf' | 'excel')[];
}

interface TimeRangeOption {
  label: string;
  value: TimeWindow;
  days?: number;
  hours?: number;
  minutes?: number;
}

// Main component
const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({
  initialData,
  className,
  isEmbedded = false,
  refreshInterval = 60000, // 1 minute
  defaultTimeWindow = TimeWindow.HOUR_1,
  defaultTab = 'cost',
  onExport,
  onAlert,
  onOptimizationStart,
  onOptimizationComplete
}) => {
  // State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(defaultTimeWindow);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() => {
    // Try to load from localStorage
    const savedConfig = typeof window !== 'undefined' ? 
      localStorage.getItem('predictive-analytics-dashboard-config') : null;
    
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse dashboard config:', e);
      }
    }
    
    // Default config
    return {
      layout: {
        cost: [
          { id: 'cost-trends', title: 'Cost Trends', type: 'line', dataKey: 'costTrend', visible: true, position: 0, size: 'lg' },
          { id: 'cost-anomalies', title: 'Cost Anomalies', type: 'scatter', dataKey: 'anomalies', visible: true, position: 1, size: 'md' },
          { id: 'cost-by-provider', title: 'Cost by Provider', type: 'pie', dataKey: 'costByProvider', visible: true, position: 2, size: 'md' },
          { id: 'cost-by-feature', title: 'Cost by Feature', type: 'bar', dataKey: 'costByFeature', visible: true, position: 3, size: 'md' },
          { id: 'projected-costs', title: 'Projected Costs', type: 'area', dataKey: 'projectedCosts', visible: true, position: 4, size: 'md' },
          { id: 'savings-opportunities', title: 'Savings Opportunities', type: 'bar', dataKey: 'savingsOpportunities', visible: true, position: 5, size: 'md' }
        ],
        performance: [
          { id: 'provider-scores', title: 'Provider Scores', type: 'radar', dataKey: 'providerScores', visible: true, position: 0, size: 'lg' },
          { id: 'response-time-trend', title: 'Response Time Trend', type: 'line', dataKey: 'responseTimeTrend', visible: true, position: 1, size: 'md' },
          { id: 'success-rate-trend', title: 'Success Rate Trend', type: 'line', dataKey: 'successRateTrend', visible: true, position: 2, size: 'md' },
          { id: 'top-performing-models', title: 'Top Performing Models', type: 'bar', dataKey: 'topPerformingModels', visible: true, position: 3, size: 'md' },
          { id: 'optimization-opportunities', title: 'Optimization Opportunities', type: 'bar', dataKey: 'optimizationOpportunities', visible: true, position: 4, size: 'md' }
        ],
        predictive: [
          { id: 'demand-forecast', title: 'Demand Forecast', type: 'line', dataKey: 'demandForecast', visible: true, position: 0, size: 'lg' },
          { id: 'resource-allocation', title: 'Resource Allocation', type: 'pie', dataKey: 'resourceAllocation', visible: true, position: 1, size: 'md' },
          { id: 'queue-optimization', title: 'Queue Optimization', type: 'bar', dataKey: 'queueOptimization', visible: true, position: 2, size: 'md' },
          { id: 'system-load', title: 'System Load Prediction', type: 'area', dataKey: 'systemLoad', visible: true, position: 3, size: 'md' },
          { id: 'scaling-recommendations', title: 'Scaling Recommendations', type: 'bar', dataKey: 'scalingRecommendations', visible: true, position: 4, size: 'md' }
        ],
        optimization: [
          { id: 'active-strategies', title: 'Active Strategies', type: 'pie', dataKey: 'activeStrategies', visible: true, position: 0, size: 'md' },
          { id: 'optimization-history', title: 'Optimization History', type: 'line', dataKey: 'optimizationHistory', visible: true, position: 1, size: 'lg' },
          { id: 'ab-testing', title: 'A/B Testing Results', type: 'bar', dataKey: 'abTesting', visible: true, position: 2, size: 'md' },
          { id: 'parameter-tuning', title: 'Parameter Tuning', type: 'radar', dataKey: 'parameterTuning', visible: true, position: 3, size: 'md' },
          { id: 'roi-tracking', title: 'ROI Tracking', type: 'area', dataKey: 'roiTracking', visible: true, position: 4, size: 'md' }
        ],
        health: [
          { id: 'system-metrics', title: 'System Metrics', type: 'line', dataKey: 'systemMetrics', visible: true, position: 0, size: 'lg' },
          { id: 'circuit-breakers', title: 'Circuit Breaker Status', type: 'pie', dataKey: 'circuitBreakers', visible: true, position: 1, size: 'md' },
          { id: 'active-alerts', title: 'Active Alerts', type: 'bar', dataKey: 'activeAlerts', visible: true, position: 2, size: 'md' },
          { id: 'health-scores', title: 'Health Scores', type: 'radialBar', dataKey: 'healthScores', visible: true, position: 3, size: 'md' },
          { id: 'performance-benchmarks', title: 'Performance Benchmarks', type: 'bar', dataKey: 'performanceBenchmarks', visible: true, position: 4, size: 'md' }
        ]
      },
      refreshInterval,
      defaultTimeWindow,
      defaultTab,
      theme: 'system',
      alertsEnabled: true,
      autoOptimizationEnabled: true,
      exportFormats: ['csv', 'pdf', 'excel']
    };
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [anomalyDetails, setAnomalyDetails] = useState<CostAnomalyResult | null>(null);
  const [optimizationDetails, setOptimizationDetails] = useState<OptimizationResult | null>(null);
  const [activeOptimization, setActiveOptimization] = useState<string | null>(null);
  const [isRunningOptimization, setIsRunningOptimization] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  
  // Refs
  const dashboardRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<Date>(new Date());
  
  // Router
  const router = useRouter();
  
  // Media query for responsive design
  const isMobile = useMediaQuery("(max-width: 768px)");"
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");"
  
  // WebSocket connection for real-time updates
  const { 
    connected: wsConnected, 
    message: wsMessage, 
    sendMessage: wsSendMessage,
    error: wsError
  } = useWebSocket('/api/ai/predictive-analytics/ws');
  
  // Time range options
  const timeRangeOptions: TimeRangeOption[] = [
    { label: '5 minutes', value: TimeWindow.MINUTE_5, minutes: 5 },
    { label: '15 minutes', value: TimeWindow.MINUTE_15, minutes: 15 },
    { label: '30 minutes', value: TimeWindow.MINUTE_30, minutes: 30 },
    { label: '1 hour', value: TimeWindow.HOUR_1, hours: 1 },
    { label: '6 hours', value: TimeWindow.HOUR_6, hours: 6 },
    { label: '12 hours', value: TimeWindow.HOUR_12, hours: 12 },
    { label: '1 day', value: TimeWindow.DAY_1, days: 1 },
    { label: '7 days', value: TimeWindow.DAY_7, days: 7 },
    { label: '30 days', value: TimeWindow.DAY_30, days: 30 }
  ];
  
  // Chart theme based on system preference
  const isDarkMode = useMemo(() => {
    if (dashboardConfig.theme === 'system') {
      return typeof window !== 'undefined' ? 
        window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    }
    return dashboardConfig.theme === 'dark';
  }, [dashboardConfig.theme]);
  
  const chartTheme = useMemo(() => {
    return isDarkMode ? darkTheme : lightTheme;
  }, [isDarkMode]);
  
  // Fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ai/predictive-analytics/dashboard?timeWindow=${timeWindow}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching dashboard metrics: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMetrics(data);
      lastFetchTimeRef.current = new Date();
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching dashboard metrics');
      
      // Show error toast
      toast({
        title: "Error fetching metrics","
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive","
      });
    } finally {
      setLoading(false);
    }
  }, [timeWindow]);
  
  // Run optimization
  const runOptimization = useCallback(async (strategy: OptimizationStrategyType) => {
    try {
      setIsRunningOptimization(true);
      
      // Notify parent if callback provided
      if (onOptimizationStart) {
        onOptimizationStart(strategy);
      }
      
      // Send WebSocket message to run optimization
      wsSendMessage({
        type: 'run-optimization',
        data: { strategy }
      });
      
      // Show toast notification
      toast({
        title: "Optimization started","
        description: `Running ${strategy.toLowerCase().replace('_', ' ')} optimization strategy...`,
        variant: "default","
      });
      
      setActiveOptimization(strategy);
      
      // In a real implementation, we would wait for the WebSocket to send back the result
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // The actual result will come through the WebSocket
    } catch (err) {
      console.error('Error running optimization:', err);
      
      toast({
        title: "Optimization failed","
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive","
      });
      
      setActiveOptimization(null);
    } finally {
      setIsRunningOptimization(false);
    }
  }, [wsSendMessage, onOptimizationStart]);
  
  // Export dashboard data
  const exportDashboard = useCallback((format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    if (!metrics) return;
    
    try {
      // If parent provided export handler, use that
      if (onExport) {
        onExport(metrics, format);
        return;
      }
      
      // Otherwise use our utility functions
      const filename = `predictive-analytics-${activeTab}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}`;
      
      switch (format) {
        case 'csv':
          exportToCSV(metrics, filename);
          break;
        case 'pdf':
          exportToPDF(metrics, filename, activeTab);
          break;
        case 'excel':
          exportToExcel(metrics, filename);
          break;
      }
      
      toast({
        title: "Export successful","
        description: `Dashboard exported as ${format.toUpperCase()}`,
        variant: "default","
      });
    } catch (err) {
      console.error('Error exporting dashboard:', err);
      
      toast({
        title: "Export failed","
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive","
      });
    }
  }, [metrics, activeTab, onExport]);
  
  // Save dashboard configuration
  const saveDashboardConfig = useCallback(() => {
    try {
      localStorage.setItem('predictive-analytics-dashboard-config', JSON.stringify(dashboardConfig));
      
      toast({
        title: "Configuration saved","
        description: "Dashboard layout and settings have been saved","
        variant: "default","
      });
    } catch (err) {
      console.error('Error saving dashboard config:', err);
      
      toast({
        title: "Save failed","
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive","
      });
    }
  }, [dashboardConfig]);
  
  // Reset dashboard configuration
  const resetDashboardConfig = useCallback(() => {
    try {
      localStorage.removeItem('predictive-analytics-dashboard-config');
      
      // Reset to default config
      setDashboardConfig({
        layout: {
          cost: [
            { id: 'cost-trends', title: 'Cost Trends', type: 'line', dataKey: 'costTrend', visible: true, position: 0, size: 'lg' },
            { id: 'cost-anomalies', title: 'Cost Anomalies', type: 'scatter', dataKey: 'anomalies', visible: true, position: 1, size: 'md' },
            { id: 'cost-by-provider', title: 'Cost by Provider', type: 'pie', dataKey: 'costByProvider', visible: true, position: 2, size: 'md' },
            { id: 'cost-by-feature', title: 'Cost by Feature', type: 'bar', dataKey: 'costByFeature', visible: true, position: 3, size: 'md' },
            { id: 'projected-costs', title: 'Projected Costs', type: 'area', dataKey: 'projectedCosts', visible: true, position: 4, size: 'md' },
            { id: 'savings-opportunities', title: 'Savings Opportunities', type: 'bar', dataKey: 'savingsOpportunities', visible: true, position: 5, size: 'md' }
          ],
          performance: [
            { id: 'provider-scores', title: 'Provider Scores', type: 'radar', dataKey: 'providerScores', visible: true, position: 0, size: 'lg' },
            { id: 'response-time-trend', title: 'Response Time Trend', type: 'line', dataKey: 'responseTimeTrend', visible: true, position: 1, size: 'md' },
            { id: 'success-rate-trend', title: 'Success Rate Trend', type: 'line', dataKey: 'successRateTrend', visible: true, position: 2, size: 'md' },
            { id: 'top-performing-models', title: 'Top Performing Models', type: 'bar', dataKey: 'topPerformingModels', visible: true, position: 3, size: 'md' },
            { id: 'optimization-opportunities', title: 'Optimization Opportunities', type: 'bar', dataKey: 'optimizationOpportunities', visible: true, position: 4, size: 'md' }
          ],
          predictive: [
            { id: 'demand-forecast', title: 'Demand Forecast', type: 'line', dataKey: 'demandForecast', visible: true, position: 0, size: 'lg' },
            { id: 'resource-allocation', title: 'Resource Allocation', type: 'pie', dataKey: 'resourceAllocation', visible: true, position: 1, size: 'md' },
            { id: 'queue-optimization', title: 'Queue Optimization', type: 'bar', dataKey: 'queueOptimization', visible: true, position: 2, size: 'md' },
            { id: 'system-load', title: 'System Load Prediction', type: 'area', dataKey: 'systemLoad', visible: true, position: 3, size: 'md' },
            { id: 'scaling-recommendations', title: 'Scaling Recommendations', type: 'bar', dataKey: 'scalingRecommendations', visible: true, position: 4, size: 'md' }
          ],
          optimization: [
            { id: 'active-strategies', title: 'Active Strategies', type: 'pie', dataKey: 'activeStrategies', visible: true, position: 0, size: 'md' },
            { id: 'optimization-history', title: 'Optimization History', type: 'line', dataKey: 'optimizationHistory', visible: true, position: 1, size: 'lg' },
            { id: 'ab-testing', title: 'A/B Testing Results', type: 'bar', dataKey: 'abTesting', visible: true, position: 2, size: 'md' },
            { id: 'parameter-tuning', title: 'Parameter Tuning', type: 'radar', dataKey: 'parameterTuning', visible: true, position: 3, size: 'md' },
            { id: 'roi-tracking', title: 'ROI Tracking', type: 'area', dataKey: 'roiTracking', visible: true, position: 4, size: 'md' }
          ],
          health: [
            { id: 'system-metrics', title: 'System Metrics', type: 'line', dataKey: 'systemMetrics', visible: true, position: 0, size: 'lg' },
            { id: 'circuit-breakers', title: 'Circuit Breaker Status', type: 'pie', dataKey: 'circuitBreakers', visible: true, position: 1, size: 'md' },
            { id: 'active-alerts', title: 'Active Alerts', type: 'bar', dataKey: 'activeAlerts', visible: true, position: 2, size: 'md' },
            { id: 'health-scores', title: 'Health Scores', type: 'radialBar', dataKey: 'healthScores', visible: true, position: 3, size: 'md' },
            { id: 'performance-benchmarks', title: 'Performance Benchmarks', type: 'bar', dataKey: 'performanceBenchmarks', visible: true, position: 4, size: 'md' }
          ]
        },
        refreshInterval,
        defaultTimeWindow,
        defaultTab,
        theme: 'system',
        alertsEnabled: true,
        autoOptimizationEnabled: true,)

exportFormats: ['csv', 'pdf', 'excel']
      });
      
      toast({
        title: "Configuration reset","
        description: "Dashboard layout and settings have been reset to defaults","
        variant: "default","
      });
    } catch (err) {
      console.error('Error resetting dashboard config:', err);
      
      toast({
        title: "Reset failed","
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive","
      });
    }
  }, [refreshInterval, defaultTimeWindow, defaultTab]);
  
  // Toggle chart visibility
  const toggleChartVisibility = useCallback((tabId: string, chartId: string) => {
    setDashboardConfig(prev => {
      const newLayout = { ...prev.layout };
      
      if (newLayout[tabId]) {
        newLayout[tabId] = newLayout[tabId].map(chart => {
          if (chart.id === chartId) {
            return { ...chart, visible: !chart.visible };
          }
          return chart;
        });
      }
      
      return { ...prev, layout: newLayout };
    });
  }, []);
  
  // Update chart size
  const updateChartSize = useCallback((tabId: string, chartId: string, size: 'sm' | 'md' | 'lg' | 'xl') => {
    setDashboardConfig(prev => {
      const newLayout = { ...prev.layout };
      
      if (newLayout[tabId]) {
        newLayout[tabId] = newLayout[tabId].map(chart => {
          if (chart.id === chartId) {
            return { ...chart, size };
          }
          return chart;
        });
      }
      
      return { ...prev, layout: newLayout };
    });
  }, []);
  
  // Move chart position
  const moveChart = useCallback((tabId: string, chartId: string, direction: 'up' | 'down') => {
    setDashboardConfig(prev => {
      const newLayout = { ...prev.layout };
      
      if (newLayout[tabId]) {
        const charts = [...newLayout[tabId]];
        const index = charts.findIndex(chart => chart.id === chartId);
        
        if (index === -1) return prev;
        
        if (direction === 'up' && index > 0) {
          // Swap with previous chart
          const temp = charts[index - 1];
          charts[index - 1] = charts[index];
          charts[index] = temp;
          
          // Update positions
          charts[index - 1].position = index - 1;
          charts[index].position = index;
        } else if (direction === 'down' && index < charts.length - 1) {
          // Swap with next chart
          const temp = charts[index + 1];
          charts[index + 1] = charts[index];
          charts[index] = temp;
          
          // Update positions
          charts[index + 1].position = index + 1;
          charts[index].position = index;
        }
        
        newLayout[tabId] = charts;
      }
      
      return { ...prev, layout: newLayout };
    });
  }, []);
  
  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!dashboardRef.current) return;
    
    if (!isFullscreen) {
      if (dashboardRef.current.requestFullscreen) {
        dashboardRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  
  // Handle WebSocket messages
  useEffect(() => {
    if (!wsMessage) return;
    
    try {
      const { type, data } = wsMessage;
      
      switch (type) {
        case 'dashboard-metrics':
          setMetrics(data);
          lastFetchTimeRef.current = new Date();
          break;
        
        case 'cost-anomaly':
          // Show notification for cost anomaly
          if (dashboardConfig.alertsEnabled) {
            toast({
              title: "Cost Anomaly Detected","
              description: `${data.metricType}: ${data.deviationPercent.toFixed(2)}% deviation`,
              variant: "destructive","
            });
            
            // Notify parent if callback provided
            if (onAlert) {
              onAlert(data);
            }
          }
          break;
        
        case 'optimization-result':
          setOptimizationDetails(data);
          setActiveOptimization(null);
          
          // Show notification for optimization result
          toast({
            title: data.isSuccessful ? "Optimization Successful" : "Optimization Failed","
            description: data.isSuccessful 
              ? `${data.strategy} improved metrics by ${Object.values(data.improvementPercent)[0]}%`
              : `${data.strategy} optimization did not improve metrics`,
            variant: data.isSuccessful ? "default" : "destructive","
          });
          
          // Notify parent if callback provided
          if (onOptimizationComplete) {
            onOptimizationComplete(data);
          }
          
          // Refresh metrics
          fetchDashboardMetrics();
          break;
        
        case 'system-alert':
          // Show notification for system alert
          if (dashboardConfig.alertsEnabled) {
            toast({
              title: `${data.alertType} Alert`,
              description: data.message,
              variant: data.severity === AlertSeverity.CRITICAL ? "destructive" :"
                       data.severity === AlertSeverity.WARNING ? "warning" : "default","
            });
            
            // Notify parent if callback provided
            if (onAlert) {
              onAlert(data);
            }
          }
          break;
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  }, [wsMessage, dashboardConfig.alertsEnabled, onAlert, onOptimizationComplete, fetchDashboardMetrics]);
  
  // Handle WebSocket connection errors
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket error:', wsError);
      
      toast({
        title: "WebSocket Connection Error","
        description: "Real-time updates are currently unavailable","
        variant: "warning","
      });
    }
  }, [wsError]);
  
  // Initial data fetch and refresh interval
  useEffect(() => {
    // Initial fetch if no data provided
    if (!initialData) {
      fetchDashboardMetrics();
    }
    
    // Set up refresh interval
    refreshTimerRef.current = setInterval(() => {
      fetchDashboardMetrics();
    }, dashboardConfig.refreshInterval);
    
    // Clean up on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchDashboardMetrics, initialData, dashboardConfig.refreshInterval]);
  
  // Request dashboard metrics via WebSocket when connected
  useEffect(() => {
    if (wsConnected) {
      wsSendMessage({
        type: 'get-dashboard-metrics',
        data: { timeWindow }
      });
    }
  }, [wsConnected, wsSendMessage, timeWindow]);
  
  // Update URL with active tab and time window
  useEffect(() => {
    if (!isEmbedded) {
      const query = new URLSearchParams(window.location.search);
      query.set('tab', activeTab);
      query.set('timeWindow', timeWindow);
      
      router.replace({
        pathname: router.pathname,
        query: query.toString()
      }, undefined, { shallow: true });
    }
  }, [activeTab, timeWindow, isEmbedded, router]);
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Filter charts based on search query
  const getFilteredCharts = useCallback((tabId: string) => {
    if (!dashboardConfig.layout[tabId]) return [];
    
    const charts = [...dashboardConfig.layout[tabId]];
    
    if (!searchQuery) {
      return charts.sort((a, b) => a.position - b.position);
    }
    
    return charts
      .filter(chart => chart.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.position - b.position);
  }, [dashboardConfig.layout, searchQuery]);
  
  // Render loading state
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-64 w-full">"
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />"
      <p className="text-muted-foreground">Loading dashboard metrics...</p>"
    </div>
  );
  
  // Render error state
  const renderError = () => (
    <Alert variant="destructive" className="mb-4">"
      <AlertCircle className="h-4 w-4" />"
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error}
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchDashboardMetrics}>"
          <RefreshCcw className="h-4 w-4 mr-2" />"
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
  
  // Render dashboard header
  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">"
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Predictive Analytics Dashboard</h1>"
        <p className="text-muted-foreground">"
          {wsConnected ? (
            <span className="flex items-center">"
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>"
              Live data • Last updated {formatDistanceToNow(lastFetchTimeRef.current)} ago
            </span>
          ) : (
            <span className="flex items-center">"
              <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>"
              Offline • Last updated {formatDistanceToNow(lastFetchTimeRef.current)} ago
            </span>
          )}
        </p>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">"
        <Select value={timeWindow} onValueChange={(value) => setTimeWindow(value as TimeWindow)}>
          <SelectTrigger className="w-[180px]">"
            <SelectValue placeholder="Select time range" />"
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon" onClick={fetchDashboardMetrics}>"
          <RefreshCcw className="h-4 w-4" />"
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">"
              <Download className="h-4 w-4" />"
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">"
            <div className="space-y-2">"
              <h4 className="font-medium">Export Dashboard</h4>"
              <div className="flex flex-col gap-2">"
                <Button 
                  variant="outline""
                  size="sm""
                  className="justify-start""
                  onClick={() => exportDashboard('csv')}
                >
                  <FileText className="h-4 w-4 mr-2" />"
                  Export as CSV
                </Button>
                <Button 
                  variant="outline""
                  size="sm""
                  className="justify-start""
                  onClick={() => exportDashboard('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" />"
                  Export as PDF
                </Button>
                <Button 
                  variant="outline""
                  size="sm""
                  className="justify-start""
                  onClick={() => exportDashboard('excel')}
                >
                  <FileText className="h-4 w-4 mr-2" />"
                  Export as Excel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button 
          variant={isEditMode ? "secondary" : "outline"}"
          size="icon""
          onClick={() => setIsEditMode(!isEditMode)}
        >
          <Settings className="h-4 w-4" />"
        </Button>
        
        <Button 
          variant="outline""
          size="icon""
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />"
          ) : (
            <Maximize2 className="h-4 w-4" />"
          )}
        </Button>
      </div>
    </div>
  );
  
  // Render dashboard tabs
  const renderTabs = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">"
      <div className="flex items-center justify-between mb-4">"
        <TabsList>
          <TabsTrigger value="cost" className="flex items-center">"
            <DollarSign className="h-4 w-4 mr-2" />"
            <span className={isMobile ? "hidden" : "inline"}>Cost Analytics</span>"
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">"
            <BarChart2 className="h-4 w-4 mr-2" />"
            <span className={isMobile ? "hidden" : "inline"}>Performance</span>"
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center">"
            <TrendingUp className="h-4 w-4 mr-2" />"
            <span className={isMobile ? "hidden" : "inline"}>Predictive Insights</span>"
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center">"
            <Sliders className="h-4 w-4 mr-2" />"
            <span className={isMobile ? "hidden" : "inline"}>Auto-optimization</span>"
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center">"
            <Activity className="h-4 w-4 mr-2" />"
            <span className={isMobile ? "hidden" : "inline"}>System Health</span>"
          </TabsTrigger>
        </TabsList>
        
        {isEditMode && (
          <div className="flex items-center gap-2">"
            <Input
              placeholder="Search charts...""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px]""
            />
            <Button variant="outline" size="sm" onClick={() => setIsConfigOpen(true)}>"
              <Sliders className="h-4 w-4 mr-2" />"
              <span>Configure</span>
            </Button>
          </div>
        )}
      </div>
      
      {/* Cost Analytics Tab */}
      <TabsContent value="cost" className="space-y-4">"
        {renderCostAnalyticsTab()}
      </TabsContent>
      
      {/* Performance Analytics Tab */}
      <TabsContent value="performance" className="space-y-4">"
        {renderPerformanceAnalyticsTab()}
      </TabsContent>
      
      {/* Predictive Insights Tab */}
      <TabsContent value="predictive" className="space-y-4">"
        {renderPredictiveInsightsTab()}
      </TabsContent>
      
      {/* Auto-optimization Tab */}
      <TabsContent value="optimization" className="space-y-4">"
        {renderAutoOptimizationTab()}
      </TabsContent>
      
      {/* System Health Tab */}
      <TabsContent value="health" className="space-y-4">"
        {renderSystemHealthTab()}
      </TabsContent>
    </Tabs>
  );
  
  // Render Cost Analytics Tab
  const renderCostAnalyticsTab = () => {
    if (loading && !metrics) return renderLoading();
    if (error) return renderError();
    if (!metrics) return null;
    
    const { costMetrics } = metrics;
    const filteredCharts = getFilteredCharts('cost');
    
    return (
      <div className="space-y-4">"
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">"
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${costMetrics.totalCost.toFixed(2)}</div>"
              <p className="text-xs text-muted-foreground">"
                {costMetrics.costTrend >= 0 ? (
                  <span className="flex items-center text-red-500">"
                    <ArrowUp className="h-4 w-4 mr-1" />"
                    {costMetrics.costTrend.toFixed(2)}% from previous period
                  </span>
                ) : (
                  <span className="flex items-center text-green-500">"
                    <ArrowDown className="h-4 w-4 mr-1" />"
                    {Math.abs(costMetrics.costTrend).toFixed(2)}% from previous period
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{costMetrics.anomalies.length}</div>"
              <p className="text-xs text-muted-foreground">"
                {costMetrics.anomalies.length > 0 ? (
                  <span className="text-amber-500">Requires attention</span>"
                ) : (
                  <span className="text-green-500">All metrics within normal range</span>"
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Projected Monthly Cost</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">"
                ${costMetrics.projectedCosts.predictedValues[TimeWindow.DAY_30].toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">"
                Based on current usage patterns
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">"
                ${Object.values(costMetrics.savingsOpportunities).reduce((a, b) => a + b, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">"
                <span className="text-green-500">Optimization opportunities available</span>"
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">"
          {filteredCharts.map((chart) => {
            if (!chart.visible && !isEditMode) return null;
            
            // Determine column span based on chart size
            const colSpan = chart.size === 'lg' ? 'md:col-span-2' : 
                           chart.size === 'xl' ? 'md:col-span-3' : '';
            
            return (
              <Card key={chart.id} className={`${colSpan} ${!chart.visible ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">"
                  <div className="flex items-center justify-between">"
                    <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>"
                    
                    {isEditMode && (
                      <div className="flex items-center gap-1">"
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => moveChart('cost', chart.id, 'up')}
                        >
                          <ChevronUp className="h-3 w-3" />"
                        </Button>
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => moveChart('cost', chart.id, 'down')}
                        >
                          <ChevronDown className="h-3 w-3" />"
                        </Button>
                        <Select 
                          value={chart.size} 
                          onValueChange={(value) => updateChartSize('cost', chart.id, value as any)}
                        >
                          <SelectTrigger className="h-6 w-16 text-xs">"
                            <SelectValue placeholder="Size" />"
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sm">Small</SelectItem>"
                            <SelectItem value="md">Medium</SelectItem>"
                            <SelectItem value="lg">Large</SelectItem>"
                            <SelectItem value="xl">X-Large</SelectItem>"
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => toggleChartVisibility('cost', chart.id)}
                        >
                          {chart.visible ? (
                            <Eye className="h-3 w-3" />"
                          ) : (
                            <EyeOff className="h-3 w-3" />"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">"
                  {renderCostChart(chart, costMetrics)}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Anomaly Details Dialog */}
        {anomalyDetails && (
          <Dialog open={!!anomalyDetails} onOpenChange={() => setAnomalyDetails(null)}>
            <DialogContent className="sm:max-w-[600px]">"
              <DialogHeader>
                <DialogTitle>Cost Anomaly Details</DialogTitle>
                <DialogDescription>
                  Detected on {format(new Date(anomalyDetails.timestamp), 'PPpp')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">"
                <div className="grid grid-cols-2 gap-4">"
                  <div>
                    <h4 className="text-sm font-medium">Metric Type</h4>"
                    <p>{anomalyDetails.metricType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Time Window</h4>"
                    <p>{anomalyDetails.timeWindow}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Actual Value</h4>"
                    <p>${anomalyDetails.actualValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Expected Value</h4>"
                    <p>${anomalyDetails.expectedValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Deviation</h4>"
                    <p className={anomalyDetails.deviationPercent > 0 ? 'text-red-500' : 'text-green-500'}>
                      {anomalyDetails.deviationPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Severity</h4>"
                    <Badge variant={
                      anomalyDetails.severity === AlertSeverity.CRITICAL ? 'destructive' :
                      anomalyDetails.severity === AlertSeverity.WARNING ? 'warning' : 'default'
                    }>
                      {anomalyDetails.severity}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Affected Features</h4>"
                  <div className="flex flex-wrap gap-2 mt-1">"
                    {anomalyDetails.affectedFeatures.map((feature) => (
                      <Badge key={feature} variant="outline">{feature}</Badge>"
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Affected Providers</h4>"
                  <div className="flex flex-wrap gap-2 mt-1">"
                    {anomalyDetails.affectedProviders.map((provider) => (
                      <Badge key={provider} variant="outline">{provider}</Badge>"
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Potential Causes</h4>"
                  <ul className="list-disc list-inside mt-1 text-sm">"
                    {anomalyDetails.potentialCauses.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Recommended Actions</h4>"
                  <ul className="list-disc list-inside mt-1 text-sm">"
                    {anomalyDetails.recommendedActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAnomalyDetails(null)}>Close</Button>"
                <Button onClick={() => {
                  setAnomalyDetails(null);
                  setActiveTab('optimization');
                }}>
                  Optimize
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };
  
  // Render Performance Analytics Tab
  const renderPerformanceAnalyticsTab = () => {
    if (loading && !metrics) return renderLoading();
    if (error) return renderError();
    if (!metrics) return null;
    
    const { performanceMetrics } = metrics;
    const filteredCharts = getFilteredCharts('performance');
    
    return (
      <div className="space-y-4">"
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">"
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.responseTimeTrend.toFixed(0)} ms</div>"
              <p className="text-xs text-muted-foreground">"
                {performanceMetrics.responseTimeTrend > 0 ? (
                  <span className="flex items-center text-red-500">"
                    <ArrowUp className="h-4 w-4 mr-1" />"
                    {performanceMetrics.responseTimeTrend.toFixed(2)}% from previous period
                  </span>
                ) : (
                  <span className="flex items-center text-green-500">"
                    <ArrowDown className="h-4 w-4 mr-1" />"
                    {Math.abs(performanceMetrics.responseTimeTrend).toFixed(2)}% from previous period
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(performanceMetrics.successRateTrend * 100).toFixed(2)}%</div>"
              <Progress value={performanceMetrics.successRateTrend * 100} className="h-2 mt-2" />"
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Top Provider</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="flex items-center">"
                <div className="mr-2">"
                  <Avatar className="h-8 w-8">"
                    <AvatarImage src={`/providers/${Object.keys(performanceMetrics.providerScores)[0]}.png`} />
                    <AvatarFallback>{Object.keys(performanceMetrics.providerScores)[0].substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className="font-medium">{Object.keys(performanceMetrics.providerScores)[0]}</div>"
                  <div className="text-xs text-muted-foreground">"
                    Score: {Object.values(performanceMetrics.providerScores)[0].overallScore.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Optimization Opportunities</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.optimizationOpportunities.length}</div>"
              <p className="text-xs text-muted-foreground">"
                {performanceMetrics.optimizationOpportunities.length > 0 ? (
                  <span className="text-amber-500">Improvements available</span>"
                ) : (
                  <span className="text-green-500">All systems optimized</span>"
                )}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">"
          {filteredCharts.map((chart) => {
            if (!chart.visible && !isEditMode) return null;
            
            // Determine column span based on chart size
            const colSpan = chart.size === 'lg' ? 'md:col-span-2' : 
                           chart.size === 'xl' ? 'md:col-span-3' : '';
            
            return (
              <Card key={chart.id} className={`${colSpan} ${!chart.visible ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">"
                  <div className="flex items-center justify-between">"
                    <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>"
                    
                    {isEditMode && (
                      <div className="flex items-center gap-1">"
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => moveChart('performance', chart.id, 'up')}
                        >
                          <ChevronUp className="h-3 w-3" />"
                        </Button>
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => moveChart('performance', chart.id, 'down')}
                        >
                          <ChevronDown className="h-3 w-3" />"
                        </Button>
                        <Select 
                          value={chart.size} 
                          onValueChange={(value) => updateChartSize('performance', chart.id, value as any)}
                        >
                          <SelectTrigger className="h-6 w-16 text-xs">"
                            <SelectValue placeholder="Size" />"
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sm">Small</SelectItem>"
                            <SelectItem value="md">Medium</SelectItem>"
                            <SelectItem value="lg">Large</SelectItem>"
                            <SelectItem value="xl">X-Large</SelectItem>"
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => toggleChartVisibility('performance', chart.id)}
                        >
                          {chart.visible ? (
                            <Eye className="h-3 w-3" />"
                          ) : (
                            <EyeOff className="h-3 w-3" />"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">"
                  {renderPerformanceChart(chart, performanceMetrics)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render Predictive Insights Tab
  const renderPredictiveInsightsTab = () => {
    if (loading && !metrics) return renderLoading();
    if (error) return renderError();
    if (!metrics) return null;
    
    const { systemMetrics } = metrics;
    const filteredCharts = getFilteredCharts('predictive');
    
    return (
      <div className="space-y-4">"
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">"
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Forecasted Demand</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{systemMetrics.queueHealth.default?.throughput.toFixed(0)} req/min</div>"
              <p className="text-xs text-muted-foreground">"
                Peak expected in 2 hours
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(systemMetrics.resourceUtilization * 100).toFixed(0)}%</div>"
              <Progress 
                value={systemMetrics.resourceUtilization * 100} 
                className="h-2 mt-2""
                indicator={systemMetrics.resourceUtilization > 0.8 ? 'bg-red-500' : 
                          systemMetrics.resourceUtilization > 0.6 ? 'bg-amber-500' : 'bg-green-500'}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Queue Health</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">"
                <div>
                  <div className="text-2xl font-bold">{systemMetrics.queueHealth.default?.currentSize || 0}</div>"
                  <p className="text-xs text-muted-foreground">Current queue size</p>"
                </div>
                <div>
                  <div className="text-2xl font-bold">{systemMetrics.queueHealth.default?.averageWaitTime.toFixed(0) || 0}ms</div>"
                  <p className="text-xs text-muted-foreground">Avg wait time</p>"
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Scaling Recommendations</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.scalingRecommendations?.length || 0}</div>"
              <p className="text-xs text-muted-foreground">"
                {systemMetrics.scalingRecommendations?.length > 0 ? (
                  <span className="text-amber-500">Scale adjustments recommended</span>"
                ) : (
                  <span className="text-green-500">Current scaling optimal</span>"
                )}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">"
          {filteredCharts.map((chart) => {
            if (!chart.visible && !isEditMode) return null;
            
            // Determine column span based on chart size
            const colSpan = chart.size === 'lg' ? 'md:col-span-2' : 
                           chart.size === 'xl' ? 'md:col-span-3' : '';
            
            return (
              <Card key={chart.id} className={`${colSpan} ${!chart.visible ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">"
                  <div className="flex items-center justify-between">"
                    <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>"
                    
                    {isEditMode && (
                      <div className="flex items-center gap-1">"
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => moveChart('predictive', chart.id, 'up')}
                        >
                          <ChevronUp className="h-3 w-3" />"
                        </Button>
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => moveChart('predictive', chart.id, 'down')}
                        >
                          <ChevronDown className="h-3 w-3" />"
                        </Button>
                        <Select 
                          value={chart.size} 
                          onValueChange={(value) => updateChartSize('predictive', chart.id, value as any)}
                        >
                          <SelectTrigger className="h-6 w-16 text-xs">"
                            <SelectValue placeholder="Size" />"
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sm">Small</SelectItem>"
                            <SelectItem value="md">Medium</SelectItem>"
                            <SelectItem value="lg">Large</SelectItem>"
                            <SelectItem value="xl">X-Large</SelectItem>"
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost""
                          size="icon""
                          className="h-6 w-6""
                          onClick={() => toggleChartVisibility('predictive', chart.id)}
                        >
                          {chart.visible ? (
                            <Eye className="h-3 w-3" />"
                          ) : (
                            <EyeOff className="h-3 w-3" />"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">"
                  {renderPredictiveChart(chart, metrics)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render Auto-optimization Tab
  const renderAutoOptimizationTab = () => {
    if (loading && !metrics) return renderLoading();
    if (error) return renderError();
    if (!metrics) return null;
    
    const { optimizationMetrics } = metrics;
    const filteredCharts = getFilteredCharts('optimization');
    
    return (
      <div className="space-y-4">"
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">"
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Active Optimizations</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{optimizationMetrics.activeExperiments}</div>"
              <p className="text-xs text-muted-foreground">"
                {activeOptimization ? (
                  <span className="text-amber-500">Running {activeOptimization}</span>"
                ) : (
                  <span>Ready to optimize</span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Cumulative Savings</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${optimizationMetrics.cumulativeSavings.toFixed(2)}</div>"
              <p className="text-xs text-muted-foreground">"
                <span className="text-green-500">Since optimization enabled</span>"
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Performance Improvement</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">"
                {Object.values(optimizationMetrics.performanceImprovements)[0]}%
              </div>
              <p className="text-xs text-muted-foreground">"
                Average response time improvement
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">"
              <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>"
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(optimizationMetrics.learningProgress * 100).toFixed(0)}%</div>"
              <Progress value={optimizationMetrics.learningProgress * 100} className="h-2 mt-2" />"
            </CardContent>
          </Card>
        </div>
        
        {/* Optimization Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Controls</CardTitle>
            <CardDescription>
              Run manual optimization or configure auto-optimization settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">"
              <div>
                <h4 className="text-sm font-medium mb-2">Run Optimization</h4>"
                <div className="space-y-2">"
                  <div className="grid grid-cols-2 gap-2">"
                    <Button 
                      variant="outline""
                      className="w-full""
                      onClick={() => runOptimization(OptimizationStrategyType.COST_MINIMIZATION)}
                      disabled={isRunningOptimization}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />"
                      Cost Minimization
                    </Button>
                    <Button 
                      variant="outline""
                      className="w-full""
                      onClick={() => runOptimization(OptimizationStrategyType.PERFORMANCE_MAXIMIZATION)}
                      disabled={isRunningOptimization}
                    >
                      <Zap className="h-4 w-4 mr-2" />"
                      Performance
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">"
                    <Button 
                      variant="outline""
                      className="w-full""
                      onClick={() => runOptimization(OptimizationStrategyType.BALANCED)}
                      disabled={isRunningOptimization}
                    >
                      <Scale className="h-4 w-4 mr-2" />"
                      Balanced
                    </Button>
                    <Button 
                      variant="outline""
                      className="w-full""
                      onClick={() => runOptimization(OptimizationStrategyType.RELIABILITY_FOCUSED)}
                      disabled={isRunningOptimization}
                    >
                      <Shield className="h-4 w-4 mr-2" />"
                      Reliability
                    </Button>
                  </div>
                </div>
                
                {isRunningOptimization && (
                  <div className="flex items-center justify-center mt-4">"
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />"
                    <span className="text-sm">Running optimization...</span>"
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Auto-Optimization Settings</h4>"
                <div className="space-y-4">"
                  <div className="flex items-center justify-between">"
                    <Label htmlFor="auto-optimization">Enable Auto-Optimization</Label>"
                    <Switch 
                      id="auto-optimization""
                      checked={dashboardConfig.autoOptimizationEnabled}
                      onCheckedChange={(checked) => {
                        setDashboardConfig(prev => ({
                          ...prev,
                          autoOptimizationEnabled: checked
                        }));
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">"
                    <Label>Default Strategy</Label>
                    <Select 
                      value={dashboardConfig.defaultStrategy || OptimizationStrategyType.BALANCED}
                      onValueChange={(value) => {
                        setDashboardConfig(prev => ({
                          ...prev,
                          defaultStrategy: value as OptimizationStrategyType
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select strategy" />"
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={OptimizationStrategyType.COST_MINIMIZATION}>Cost Minimization</SelectItem>
                        <SelectItem value={OptimizationStrategyType.PERFORMANCE_MAXIMIZATION}>Performance Maximization</SelectItem>
                        <SelectItem value={OptimizationStrategyType.BALANCED}>Balanced</SelectItem>
                        <SelectItem value={OptimizationStrategyType.RELIABILITY_FOCUSED}>Reliability Focused</SelectItem>
                        <SelectItem value={OptimizationStrategyType.QUALITY_FOCUSED}>Quality Focused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">"
                    <div className="flex items-center justify-between">"
                      <Label>Optimization Frequency</Label>
                      <span className="text-xs text-muted-foreground">"
                        {dashboardConfig.optimizationInterval ? 
                          `${Math.floor(dashboardConfig.optimizationInterval / 3600000)} hours` : 
                          '1 hour'}
                      </span>
                    </div>
                    <Slider 
                      defaultValue={[dashboardConfig.optimizationInterval || 3600000]}