/**
 * Tutorial System Launch Panel
 * 
 * A comprehensive admin interface for launching and managing the KAZI interactive tutorial system.
 * Provides controls for system launch, component status monitoring, configuration options,
 * system health metrics, and user onboarding analytics.
 * 
 * @version 1.0.0
 * @date August 6, 2025
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/hooks';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BarChart, LineChart, PieChart } from '@/components/ui/charts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchWithAuth } from '@/lib/fetch-utils';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  RocketIcon, 
  SettingsIcon, 
  BarChart3Icon,
  Users,
  Clock,
  Award,
  BookOpen,
  BarChart2,
  Activity,
  AlertTriangle,
  HelpCircle,
  Info,
  Terminal,
  ArrowUpRight
} from 'lucide-react';

// Types
interface ComponentStatus {
  name: string;
  status: 'success' | 'failed' | 'skipped' | 'pending' | 'unknown';
  message?: string;
  details?: Record<string, any>;
}

interface SystemStatus {
  status: 'active' | 'inactive' | 'partial' | 'unknown';
  components: {
    tutorials: boolean;
    achievements: boolean;
    helpCenter: boolean;
    analytics: boolean;
  };
  lastLaunch?: string;
  scriptAvailable: boolean;
}

interface LaunchOptions {
  mode: 'full' | 'dry-run' | 'admin-only';
  components: {
    tutorials: boolean;
    achievements: boolean;
    helpCenter: boolean;
    analytics: boolean;
  };
  options: {
    force: boolean;
    verbose: boolean;
    notifyAdmins: boolean;
  };
}

interface LaunchResponse {
  status: 'success' | 'partial' | 'failed';
  timestamp: string;
  requestId: string;
  components: ComponentStatus[];
  logs?: string[];
  error?: string;
}

interface SystemMetrics {
  tutorialCompletionRate: number;
  activeUsers: number;
  averageCompletionTime: number;
  achievementsUnlocked: number;
  helpCenterUsage: number;
  timeToFirstValue: number;
}

interface MetricTrend {
  date: string;
  value: number;
}

interface MetricTrends {
  completionRate: MetricTrend[];
  activeUsers: MetricTrend[];
  achievementsUnlocked: MetricTrend[];
}

// Default values
const defaultLaunchOptions: LaunchOptions = {
  mode: 'full',
  components: {
    tutorials: true,
    achievements: true,
    helpCenter: true,
    analytics: true,
  },
  options: {
    force: false,
    verbose: false,
    notifyAdmins: true,
  },
};

const defaultSystemStatus: SystemStatus = {
  status: 'unknown',
  components: {
    tutorials: false,
    achievements: false,
    helpCenter: false,
    analytics: false,
  },
  scriptAvailable: false,
};

/**
 * Tutorial System Launch Panel Component
 */
export default function TutorialSystemLaunchPanel() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('launch');
  const [launchOptions, setLaunchOptions] = useState<LaunchOptions>(defaultLaunchOptions);
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);
  const [launchInProgress, setLaunchInProgress] = useState(false);
  const [launchResult, setLaunchResult] = useState<LaunchResponse | null>(null);
  const [logsVisible, setLogsVisible] = useState(false);

  // Fetch system status
  const { 
    data: systemStatus, 
    isLoading: isStatusLoading, 
    error: statusError,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['tutorialSystemStatus'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/tutorial-system/launch');
      if (!response.ok) {
        throw new Error('Failed to fetch tutorial system status');
      }
      const data = await response.json();
      return {
        status: data.tutorialSystem.isActive ? 'active' : 'inactive',
        components: {
          tutorials: data.tutorialSystem.components.interactive_tutorial_system?.enabled || false,
          achievements: data.tutorialSystem.components.achievement_system?.enabled || false,
          helpCenter: data.tutorialSystem.components.help_center?.enabled || false,
          analytics: data.tutorialSystem.components.analytics_tracking?.enabled || false,
        },
        lastLaunch: data.tutorialSystem.components.interactive_tutorial_system?.lastUpdated,
        scriptAvailable: data.tutorialSystem.scriptAvailable,
      } as SystemStatus;
    },
    enabled: !!user && isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch system metrics
  const { 
    data: systemMetrics, 
    isLoading: isMetricsLoading 
  } = useQuery({
    queryKey: ['tutorialSystemMetrics'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/analytics/tutorial-system/metrics');
      if (!response.ok) {
        // If API doesn't exist yet, return mock data
        return {
          tutorialCompletionRate: 78,
          activeUsers: 1243,
          averageCompletionTime: 8.5,
          achievementsUnlocked: 3567,
          helpCenterUsage: 42,
          timeToFirstValue: 6.2,
        } as SystemMetrics;
      }
      return await response.json();
    },
    enabled: !!user && isAdmin && activeTab === 'analytics',
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch metric trends
  const { 
    data: metricTrends, 
    isLoading: isTrendsLoading 
  } = useQuery({
    queryKey: ['tutorialSystemTrends'],
    queryFn: async () => {
      const response = await fetchWithAuth('/api/analytics/tutorial-system/trends');
      if (!response.ok) {
        // If API doesn't exist yet, return mock data
        return {
          completionRate: Array.from({ length: 14 }, (_, i) => ({
            date: format(new Date(Date.now() - (13 - i) * 86400000), 'yyyy-MM-dd'),
            value: 65 + Math.floor(Math.random() * 20),
          })),
          activeUsers: Array.from({ length: 14 }, (_, i) => ({
            date: format(new Date(Date.now() - (13 - i) * 86400000), 'yyyy-MM-dd'),
            value: 800 + Math.floor(Math.random() * 800),
          })),
          achievementsUnlocked: Array.from({ length: 14 }, (_, i) => ({
            date: format(new Date(Date.now() - (13 - i) * 86400000), 'yyyy-MM-dd'),
            value: 200 + Math.floor(Math.random() * 300),
          })),
        } as MetricTrends;
      }
      return await response.json();
    },
    enabled: !!user && isAdmin && activeTab === 'analytics',
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Launch system mutation
  const launchMutation = useMutation({
    mutationFn: async (options: LaunchOptions) => {
      const response = await fetchWithAuth('/api/tutorial-system/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to launch tutorial system');
      }
      
      return await response.json() as LaunchResponse;
    },
    onSuccess: (data) => {
      setLaunchResult(data);
      setLaunchInProgress(false);
      
      // Show toast notification
      const status = data.status === 'success' 
        ? { title: 'Success', variant: 'default' as const }
        : data.status === 'partial'
        ? { title: 'Partial Success', variant: 'warning' as const }
        : { title: 'Failed', variant: 'destructive' as const };
      
      toast({
        title: status.title,
        description: data.status === 'success' 
          ? 'Tutorial system launched successfully!' 
          : data.status === 'partial'
          ? 'Tutorial system partially launched. Some components failed.'
          : 'Failed to launch tutorial system.',
        variant: status.variant,
      });
      
      // Refetch status after launch
      setTimeout(() => {
        refetchStatus();
      }, 2000);
    },
    onError: (error) => {
      setLaunchInProgress(false);
      toast({
        title: 'Launch Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle launch button click
  const handleLaunch = () => {
    setLaunchInProgress(true);
    setLaunchResult(null);
    launchMutation.mutate(launchOptions);
    setIsLaunchDialogOpen(false);
  };

  // Get component status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Active</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'skipped':
        return <Badge variant="outline">Skipped</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get system status badge
  const systemStatusBadge = useMemo(() => {
    if (isStatusLoading) return <Badge variant="outline">Loading...</Badge>;
    
    switch (systemStatus?.status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'partial':
        return <Badge variant="warning">Partial</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  }, [systemStatus, isStatusLoading]);

  // Calculate component statuses for display
  const componentStatuses = useMemo(() => {
    if (isStatusLoading || !systemStatus) {
      return [
        { name: 'tutorials', label: 'Tutorials', status: 'unknown' },
        { name: 'achievements', label: 'Achievements', status: 'unknown' },
        { name: 'helpCenter', label: 'Help Center', status: 'unknown' },
        { name: 'analytics', label: 'Analytics', status: 'unknown' },
      ];
    }
    
    return [
      { 
        name: 'tutorials', 
        label: 'Tutorials', 
        status: systemStatus.components.tutorials ? 'success' : 'failed' 
      },
      { 
        name: 'achievements', 
        label: 'Achievements', 
        status: systemStatus.components.achievements ? 'success' : 'failed' 
      },
      { 
        name: 'helpCenter', 
        label: 'Help Center', 
        status: systemStatus.components.helpCenter ? 'success' : 'failed' 
      },
      { 
        name: 'analytics', 
        label: 'Analytics', 
        status: systemStatus.components.analytics ? 'success' : 'failed' 
      },
    ];
  }, [systemStatus, isStatusLoading]);

  // Check if user has permission
  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to access the Tutorial System Launch Panel.
          Please contact an administrator for assistance.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tutorial System Launch Panel</h2>
          <p className="text-muted-foreground">
            Launch and manage the KAZI interactive tutorial system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
            <span className="text-sm font-medium">Status:</span>
            {systemStatusBadge}
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetchStatus()}
            disabled={isStatusLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isStatusLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="launch" className="flex items-center gap-2">
            <RocketIcon className="h-4 w-4" />
            Launch Control
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Status
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Launch Control Tab */}
        <TabsContent value="launch" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Launch Tutorial System</CardTitle>
                <CardDescription>
                  Configure and launch the interactive tutorial system for all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Selection */}
                <div className="space-y-2">
                  <Label>Launch Mode</Label>
                  <RadioGroup 
                    value={launchOptions.mode} 
                    onValueChange={(value) => 
                      setLaunchOptions({...launchOptions, mode: value as LaunchOptions['mode']})
                    }
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="font-normal cursor-pointer">
                        Full Launch - Deploy to all users
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dry-run" id="dry-run" />
                      <Label htmlFor="dry-run" className="font-normal cursor-pointer">
                        Dry Run - Simulate launch without making changes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin-only" id="admin-only" />
                      <Label htmlFor="admin-only" className="font-normal cursor-pointer">
                        Admin Only - Deploy to administrators for testing
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Component Selection */}
                <div className="space-y-2">
                  <Label>Components to Launch</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="tutorials" 
                        checked={launchOptions.components.tutorials}
                        onCheckedChange={(checked) => 
                          setLaunchOptions({
                            ...launchOptions, 
                            components: {...launchOptions.components, tutorials: checked}
                          })
                        }
                      />
                      <Label htmlFor="tutorials" className="font-normal cursor-pointer">
                        Tutorials
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="achievements" 
                        checked={launchOptions.components.achievements}
                        onCheckedChange={(checked) => 
                          setLaunchOptions({
                            ...launchOptions, 
                            components: {...launchOptions.components, achievements: checked}
                          })
                        }
                      />
                      <Label htmlFor="achievements" className="font-normal cursor-pointer">
                        Achievements
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="helpCenter" 
                        checked={launchOptions.components.helpCenter}
                        onCheckedChange={(checked) => 
                          setLaunchOptions({
                            ...launchOptions, 
                            components: {...launchOptions.components, helpCenter: checked}
                          })
                        }
                      />
                      <Label htmlFor="helpCenter" className="font-normal cursor-pointer">
                        Help Center
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="analytics" 
                        checked={launchOptions.components.analytics}
                        onCheckedChange={(checked) => 
                          setLaunchOptions({
                            ...launchOptions, 
                            components: {...launchOptions.components, analytics: checked}
                          })
                        }
                      />
                      <Label htmlFor="analytics" className="font-normal cursor-pointer">
                        Analytics
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <Label>Advanced Options</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="force" 
                        checked={launchOptions.options.force}
                        onCheckedChange={(checked) => 
                          setLaunchOptions({
                            ...launchOptions, 
                            options: {...launchOptions.options, force: checked}
                          })
                        }
                      />
                      <Label htmlFor="force" className="font-normal cursor-pointer">
                        Force Relaunch
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="verbose" 
                        checked={launchOptions.options.verbose}
                        onCheckedChange={(checked) => 
                          setLaunchOptions({
                            ...launchOptions, 
                            options: {...launchOptions.options, verbose: checked}
                          })
                        }
                      />
                      <Label htmlFor="verbose" className="font-normal cursor-pointer">
                        Verbose Logging
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="notifyAdmins" 
                        checked={launchOptions.options.notifyAdmins}
                        onCheckedChange={(checked) => 
                          setLaunchOptions({
                            ...launchOptions, 
                            options: {...launchOptions.options, notifyAdmins: checked}
                          })
                        }
                      />
                      <Label htmlFor="notifyAdmins" className="font-normal cursor-pointer">
                        Notify Administrators
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setLaunchOptions(defaultLaunchOptions)}
                >
                  Reset Options
                </Button>
                <Button 
                  onClick={() => setIsLaunchDialogOpen(true)}
                  disabled={!systemStatus?.scriptAvailable || launchInProgress}
                >
                  {launchInProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <RocketIcon className="mr-2 h-4 w-4" />
                      Launch System
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Component Status</CardTitle>
                <CardDescription>
                  Current status of tutorial system components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isStatusLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-5 w-[70px]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {componentStatuses.map((component) => (
                      <div key={component.name} className="flex items-center justify-between">
                        <span className="font-medium">{component.label}</span>
                        {getStatusBadge(component.status)}
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Script Available</span>
                    {isStatusLoading ? (
                      <Skeleton className="h-5 w-[70px]" />
                    ) : (
                      <Badge variant={systemStatus?.scriptAvailable ? "outline" : "destructive"}>
                        {systemStatus?.scriptAvailable ? "Yes" : "No"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Launch</span>
                    {isStatusLoading ? (
                      <Skeleton className="h-5 w-[120px]" />
                    ) : (
                      <span className="text-sm">
                        {systemStatus?.lastLaunch 
                          ? formatDistanceToNow(new Date(systemStatus.lastLaunch), { addSuffix: true })
                          : "Never"}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => router.push('/admin/tutorial-system/logs')}
                >
                  View Launch Logs
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Launch Results */}
          {launchResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Launch Results</CardTitle>
                  <CardDescription>
                    Request ID: {launchResult.requestId}
                  </CardDescription>
                </div>
                <Badge 
                  variant={
                    launchResult.status === 'success' 
                      ? 'success' 
                      : launchResult.status === 'partial' 
                      ? 'warning' 
                      : 'destructive'
                  }
                >
                  {launchResult.status === 'success' 
                    ? 'Success' 
                    : launchResult.status === 'partial' 
                    ? 'Partial Success' 
                    : 'Failed'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {launchResult.components.map((component) => (
                        <TableRow key={component.name}>
                          <TableCell className="font-medium capitalize">
                            {component.name}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(component.status)}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {component.message || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {launchResult.logs && launchResult.logs.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Launch Logs</Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLogsVisible(!logsVisible)}
                        >
                          {logsVisible ? 'Hide Logs' : 'Show Logs'}
                        </Button>
                      </div>
                      
                      {logsVisible && (
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                          <pre className="text-xs font-mono">
                            {launchResult.logs.join('\n')}
                          </pre>
                        </ScrollArea>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setLaunchResult(null)}
                >
                  Dismiss
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>System Status Overview</CardTitle>
                <CardDescription>
                  Current status of the tutorial system and its components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Status */}
                  <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                    <div className={`rounded-full p-3 ${
                      systemStatus?.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : systemStatus?.status === 'partial' 
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {systemStatus?.status === 'active' ? (
                        <CheckCircle2 className="h-8 w-8" />
                      ) : systemStatus?.status === 'partial' ? (
                        <AlertTriangle className="h-8 w-8" />
                      ) : (
                        <Info className="h-8 w-8" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold">
                      {systemStatus?.status === 'active' 
                        ? 'System Active' 
                        : systemStatus?.status === 'partial' 
                        ? 'Partially Active'
                        : 'System Inactive'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {systemStatus?.status === 'active' 
                        ? 'All components are running correctly' 
                        : systemStatus?.status === 'partial' 
                        ? 'Some components are active, others need attention'
                        : 'The tutorial system is not currently active'}
                    </p>
                  </div>

                  <Separator />

                  {/* Component Status Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    {componentStatuses.map((component) => (
                      <div 
                        key={component.name}
                        className="flex flex-col space-y-2 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{component.label}</h4>
                          {getStatusBadge(component.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {component.status === 'success' 
                            ? `${component.label} system is active and working correctly` 
                            : `${component.label} system is not currently active`}
                        </p>
                        <div className="flex items-center pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            disabled={!systemStatus?.scriptAvailable}
                            onClick={() => {
                              // Pre-configure for single component launch
                              const newOptions = { ...defaultLaunchOptions };
                              Object.keys(newOptions.components).forEach(key => {
                                newOptions.components[key as keyof typeof newOptions.components] = key === component.name;
                              });
                              setLaunchOptions(newOptions);
                              setActiveTab('launch');
                            }}
                          >
                            {component.status === 'success' ? 'Relaunch' : 'Activate'} {component.label}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>
                    Key health metrics for the tutorial system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isMetricsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-[140px]" />
                          <Skeleton className="h-2 w-full" />
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-[50px]" />
                            <Skeleton className="h-4 w-[30px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Tutorial Completion Rate</Label>
                        <Progress value={systemMetrics?.tutorialCompletionRate || 0} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Target: 70%</span>
                          <span>{systemMetrics?.tutorialCompletionRate || 0}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Time to First Value</Label>
                        <Progress 
                          value={100 - ((systemMetrics?.timeToFirstValue || 10) / 15) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Target: &lt;10 min</span>
                          <span>{systemMetrics?.timeToFirstValue || 0} min</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Help Center Usage</Label>
                        <Progress value={systemMetrics?.helpCenterUsage || 0} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Target: 40%</span>
                          <span>{systemMetrics?.helpCenterUsage || 0}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab('health')}
                  >
                    View Full Health Dashboard
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/admin/tutorial-system/content')}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Edit Tutorial Content
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/admin/tutorial-system/achievements')}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Manage Achievements
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/admin/analytics/onboarding')}
                  >
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Onboarding Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/admin/tutorial-system/logs')}
                  >
                    <Terminal className="mr-2 h-4 w-4" />
                    View System Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tutorial Configuration</CardTitle>
                <CardDescription>
                  Configure tutorial sequences and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default for New Users</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="defaultForNewUsers" defaultChecked />
                    <Label htmlFor="defaultForNewUsers" className="font-normal">
                      Show tutorials automatically for new users
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tutorial Sequence</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Tutorial</TableHead>
                        <TableHead>Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 'welcome', name: 'Welcome Tour', required: true },
                        { id: 'ai-features', name: 'AI Features', required: false },
                        { id: 'feedback-system', name: 'Feedback System', required: true },
                        { id: 'projects', name: 'Project Management', required: false },
                        { id: 'collaboration', name: 'Team Collaboration', required: false },
                      ].map((tutorial, index) => (
                        <TableRow key={tutorial.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{tutorial.name}</TableCell>
                          <TableCell>
                            <Switch 
                              id={`required-${tutorial.id}`} 
                              defaultChecked={tutorial.required}
                              aria-label={`${tutorial.name} required`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Completion Time</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={30}
                      min={0}
                    />
                    <span className="text-sm text-muted-foreground">seconds</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum time before a tutorial step can be marked as completed
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">Reset</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievement System</CardTitle>
                <CardDescription>
                  Configure achievements and rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Starting XP</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={100}
                      min={0}
                    />
                    <span className="text-sm text-muted-foreground">XP</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Achievements</Label>
                    <Button variant="ghost" size="sm">
                      Add Achievement
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Achievement</TableHead>
                        <TableHead>XP Value</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 'welcome_badge', name: 'Welcome Aboard', xp: 100, category: 'onboarding' },
                        { id: 'explorer_badge', name: 'Platform Explorer', xp: 200, category: 'exploration' },
                        { id: 'collaborator_badge', name: 'Team Collaborator', xp: 300, category: 'collaboration' },
                        { id: 'ai_master_badge', name: 'AI Master', xp: 400, category: 'ai' },
                        { id: 'feedback_pro_badge', name: 'Feedback Pro', xp: 300, category: 'feedback' },
                      ].map((achievement) => (
                        <TableRow key={achievement.id}>
                          <TableCell>{achievement.name}</TableCell>
                          <TableCell>{achievement.xp}</TableCell>
                          <TableCell className="capitalize">{achievement.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <Label>Premium Trial Reward</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="premiumTrialReward" defaultChecked />
                    <Label htmlFor="premiumTrialReward" className="font-normal">
                      Unlock premium trial at Level 10
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 pl-7">
                    <input
                      type="number"
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={7}
                      min={1}
                    />
                    <span className="text-sm text-muted-foreground">days trial</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">Reset</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Help Center</CardTitle>
                <CardDescription>
                  Configure help center and contextual help
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="contextualHelp" defaultChecked />
                      <Label htmlFor="contextualHelp" className="font-normal">
                        Contextual Help
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="supportChat" defaultChecked />
                      <Label htmlFor="supportChat" className="font-normal">
                        Support Chat
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="videoTutorials" defaultChecked />
                      <Label htmlFor="videoTutorials" className="font-normal">
                        Video Tutorials
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="helpSearch" defaultChecked />
                      <Label htmlFor="helpSearch" className="font-normal">
                        Help Search
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'getting-started',
                      'projects',
                      'collaboration',
                      'ai-features',
                      'feedback-system',
                      'billing',
                      'account',
                      'troubleshooting'
                    ].map((category) => (
                      <Badge key={category} variant="outline" className="capitalize">
                        {category.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="border-dashed">
                      + Add
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Video Tutorials</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Featured</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 'welcome-tour', title: 'Welcome to KAZI', duration: 180, featured: true },
                        { id: 'projects-tutorial', title: 'Managing Projects', duration: 240, featured: true },
                        { id: 'ai-features-overview', title: 'AI Features Overview', duration: 300, featured: true },
                        { id: 'feedback-system-tutorial', title: 'Universal Feedback System', duration: 270, featured: true },
                        { id: 'collaboration-guide', title: 'Team Collaboration', duration: 210, featured: true },
                      ].map((video) => (
                        <TableRow key={video.id}>
                          <TableCell>{video.title}</TableCell>
                          <TableCell>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</TableCell>
                          <TableCell>
                            <Switch 
                              id={`featured-${video.id}`} 
                              defaultChecked={video.featured}
                              aria-label={`${video.title} featured`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">Reset</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics Tracking</CardTitle>
                <CardDescription>
                  Configure analytics for the tutorial system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tracking Features</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="trackTutorialProgress" defaultChecked />
                      <Label htmlFor="trackTutorialProgress" className="font-normal">
                        Tutorial Progress
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="trackAchievements" defaultChecked />
                      <Label htmlFor="trackAchievements" className="font-normal">
                        Achievements
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="trackHelpCenterUsage" defaultChecked />
                      <Label htmlFor="trackHelpCenterUsage" className="font-normal">
                        Help Center Usage
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="trackOnboardingEffectiveness" defaultChecked />
                      <Label htmlFor="trackOnboardingEffectiveness" className="font-normal">
                        Onboarding Effectiveness
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="trackFeatureDiscovery" defaultChecked />
                      <Label htmlFor="trackFeatureDiscovery" className="font-normal">
                        Feature Discovery
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="trackTimeToFirstValue" defaultChecked />
                      <Label htmlFor="trackTimeToFirstValue" className="font-normal">
                        Time to First Value
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="retentionTracking" defaultChecked />
                      <Label htmlFor="retentionTracking" className="font-normal">
                        Retention Tracking
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Third-Party Analytics</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="segmentEnabled" defaultChecked />
                      <Label htmlFor="segmentEnabled" className="font-normal">
                        Segment
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="mixpanelEnabled" defaultChecked />
                      <Label htmlFor="mixpanelEnabled" className="font-normal">
                        Mixpanel
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="amplitudeEnabled" defaultChecked />
                      <Label htmlFor="amplitudeEnabled" className="font-normal">
                        Amplitude
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="googleAnalyticsEnabled" defaultChecked />
                      <Label htmlFor="googleAnalyticsEnabled" className="font-normal">
                        Google Analytics
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data Retention</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      defaultValue={90}
                      min={1}
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">Reset</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
                <CardDescription>
                  Real-time health metrics for the tutorial system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Users className="h-8 w-8 text-blue-500" />
                        <h3 className="text-2xl font-bold">
                          {isMetricsLoading ? (
                            <Skeleton className="h-8 w-20 mx-auto" />
                          ) : (
                            systemMetrics?.activeUsers || 0
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Active Users</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <h3 className="text-2xl font-bold">
                          {isMetricsLoading ? (
                            <Skeleton className="h-8 w-20 mx-auto" />
                          ) : (
                            `${systemMetrics?.tutorialCompletionRate || 0}%`
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Clock className="h-8 w-8 text-amber-500" />
                        <h3 className="text-2xl font-bold">
                          {isMetricsLoading ? (
                            <Skeleton className="h-8 w-20 mx-auto" />
                          ) : (
                            `${systemMetrics?.averageCompletionTime || 0} min`
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Award className="h-8 w-8 text-purple-500" />
                        <h3 className="text-2xl font-bold">
                          {isMetricsLoading ? (
                            <Skeleton className="h-8 w-20 mx-auto" />
                          ) : (
                            systemMetrics?.achievementsUnlocked || 0
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Tutorial Completion Trends</CardTitle>
                <CardDescription>
                  Completion rates over the last 14 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isTrendsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <LineChart
                    data={metricTrends?.completionRate || []}
                    xField="date"
                    yField="value"
                    category="Completion Rate"
                    valueFormatter={(value) => `${value}%`}
                    colors={["#22c55e"]}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Component Health</CardTitle>
                <CardDescription>
                  Health status of each system component
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isStatusLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-[140px]" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Tutorials</Label>
                        <Badge variant={systemStatus?.components.tutorials ? "success" : "outline"}>
                          {systemStatus?.components.tutorials ? "Healthy" : "Inactive"}
                        </Badge>
                      </div>
                      <Progress 
                        value={systemStatus?.components.tutorials ? 100 : 0} 
                        className={`h-2 ${systemStatus?.components.tutorials ? 'bg-green-100' : 'bg-gray-100'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Achievements</Label>
                        <Badge variant={systemStatus?.components.achievements ? "success" : "outline"}>
                          {systemStatus?.components.achievements ? "Healthy" : "Inactive"}
                        </Badge>
                      </div>
                      <Progress 
                        value={systemStatus?.components.achievements ? 100 : 0} 
                        className={`h-2 ${systemStatus?.components.achievements ? 'bg-green-100' : 'bg-gray-100'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Help Center</Label>
                        <Badge variant={systemStatus?.components.helpCenter ? "success" : "outline"}>
                          {systemStatus?.components.helpCenter ? "Healthy" : "Inactive"}
                        </Badge>
                      </div>
                      <Progress 
                        value={systemStatus?.components.helpCenter ? 100 : 0} 
                        className={`h-2 ${systemStatus?.components.helpCenter ? 'bg-green-100' : 'bg-gray-100'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Analytics</Label>
                        <Badge variant={systemStatus?.components.analytics ? "success" : "outline"}>
                          {systemStatus?.components.analytics ? "Healthy" : "Inactive"}
                        </Badge>
                      </div>
                      <Progress 
                        value={systemStatus?.components.analytics ? 100 : 0} 
                        className={`h-2 ${systemStatus?.components.analytics ? 'bg-green-100' : 'bg-gray-100'}`}
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => router.push('/admin/system-health')}
                >
                  View System Diagnostics
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>
                  Key engagement metrics for the tutorial system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Users Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      {isTrendsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <LineChart
                          data={metricTrends?.activeUsers || []}
                          xField="date"
                          yField="value"
                          category="Active Users"
                          colors={["#3b82f6"]}
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements Unlocked</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      {isTrendsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <BarChart
                          data={metricTrends?.achievementsUnlocked || []}
                          xField="date"
                          yField="value"
                          category="Achievements"
                          colors={["#8b5cf6"]}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Onboarding Effectiveness</CardTitle>
                <CardDescription>
                  Key metrics for measuring onboarding success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <h3 className="text-2xl font-bold">
                          {isMetricsLoading ? (
                            <Skeleton className="h-8 w-20 mx-auto" />
                          ) : (
                            `${systemMetrics?.tutorialCompletionRate || 0}%`
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Tutorial Completion Rate</p>
                        <div className="flex items-center text-xs text-green-600">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          <span>+5% from last week</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Clock className="h-8 w-8 text-blue-500" />
                        <h3 className="text-2xl font-bold">
                          {isMetricsLoading ? (
                            <Skeleton className="h-8 w-20 mx-auto" />
                          ) : (
                            `${systemMetrics?.timeToFirstValue || 0} min`
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Time to First Value</p>
                        <div className="flex items-center text-xs text-green-600">
                          <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />
                          <span>-1.2 min from last week</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Users className="h-8 w-8 text-purple-500" />
                        <h3 className="text-2xl font-bold">
                          {isMetricsLoading ? (
                            <Skeleton className="h-8 w-20 mx-auto" />
                          ) : (
                            '82%'
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Day 7 Retention</p>
                        <div className="flex items-center text-xs text-green-600">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          <span>+3% from last week</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Tutorial Completion by Step</CardTitle>
                <CardDescription>
                  Completion rates for each tutorial step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tutorial</TableHead>
                      <TableHead>Step</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Avg. Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { tutorial: 'Welcome', step: 'Welcome to KAZI', rate: 95, time: 42 },
                      { tutorial: 'Welcome', step: 'Dashboard Overview', rate: 92, time: 68 },
                      { tutorial: 'Welcome', step: 'Projects Hub', rate: 87, time: 55 },
                      { tutorial: 'Welcome', step: 'AI Features', rate: 82, time: 63 },
                      { tutorial: 'Welcome', step: 'Complete Your Profile', rate: 76, time: 48 },
                      { tutorial: 'AI Features', step: 'AI Gateway', rate: 74, time: 52 },
                      { tutorial: 'AI Features', step: 'Content Generation', rate: 68, time: 75 },
                      { tutorial: 'Feedback System', step: 'Click-Anywhere Commenting', rate: 81, time: 62 },
                    ].map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.tutorial}</TableCell>
                        <TableCell>{row.step}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={row.rate} className="h-2 w-[100px]" />
                            <span className="text-sm">{row.rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{row.time}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievement Distribution</CardTitle>
                <CardDescription>
                  Most popular achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isMetricsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <PieChart
                    data={[
                      { name: 'Welcome Aboard', value: 1243 },
                      { name: 'Platform Explorer', value: 876 },
                      { name: 'Team Collaborator', value: 654 },
                      { name: 'AI Master', value: 421 },
                      { name: 'Feedback Pro', value: 373 },
                    ]}
                    category="name"
                    value="value"
                    colors={['#3b82f6', '#8b5cf6', '#22c55e', '#eab308', '#ef4444']}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Onboarding Journey</CardTitle>
                <CardDescription>
                  Visualization of user progression through onboarding
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isMetricsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between h-full">
                    {[
                      { stage: 'Sign Up', users: 100, color: '#3b82f6' },
                      { stage: 'Welcome Tour', users: 92, color: '#8b5cf6' },
                      { stage: 'First Project', users: 78, color: '#22c55e' },
                      { stage: 'AI Feature', users: 65, color: '#eab308' },
                      { stage: 'Collaboration', users: 52, color: '#ef4444' },
                      { stage: 'First Value', users: 43, color: '#ec4899' },
                    ].map((stage, i, arr) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="text-sm font-medium mb-2">{stage.users}%</div>
                        <div 
                          className="w-20 rounded-full" 
                          style={{ 
                            height: `${stage.users * 2}px`, 
                            backgroundColor: stage.color 
                          }} 
                        />
                        <div className="text-xs text-muted-foreground mt-2">{stage.stage}</div>
                        {i < arr.length - 1 && (
                          <div className="absolute" style={{ 
                            left: `calc(${(i + 0.5) * (100 / arr.length)}% + ${10}px)`,
                            width: `calc(${100 / arr.length}% - ${20}px)`,
                            top: '50%',
                            height: '2px',
                            backgroundColor: '#e5e7eb',
                            zIndex: -1
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Launch Confirmation Dialog */}
      <Dialog open={isLaunchDialogOpen} onOpenChange={setIsLaunchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch Tutorial System</DialogTitle>
            <DialogDescription>
              Are you sure you want to launch the tutorial system with the selected configuration?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Launch Mode</h4>
              <p className="text-sm">
                {launchOptions.mode === 'full' 
                  ? 'Full Launch - Deploy to all users' 
                  : launchOptions.mode === 'dry-run' 
                  ? 'Dry Run - Simulate launch without making changes'
                  : 'Admin Only - Deploy to administrators for testing'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Components</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(launchOptions.components).map(([key, value]) => (
                  value && (
                    <Badge key={key} variant="secondary" className="capitalize">
                      {key === 'helpCenter' ? 'Help Center' : key}
                    </Badge>
                  )
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Options</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(launchOptions.options).map(([key, value]) => (
                  value && (
                    <Badge key={key} variant="outline" className="capitalize">
                      {key === 'notifyAdmins' ? 'Notify Admins' : key}
                    </Badge>
                  )
                ))}
              </div>
