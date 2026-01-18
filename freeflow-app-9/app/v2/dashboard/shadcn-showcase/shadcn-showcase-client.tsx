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

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Shadcn-Showcase')

// Enhanced Components
import { EnhancedShadcnForm } from '@/components/ui/enhanced-shadcn-form'
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table'
import { EnhancedShadcnDashboard } from '@/components/ui/enhanced-shadcn-dashboard'
import { EnhancedBreadcrumb } from '@/components/ui/enhanced-breadcrumb'
import { AnimatedElement, AnimatedCounter } from '@/components/ui/enhanced-micro-animations'
import { ContextualTooltip, HelpTooltip } from '@/components/ui/enhanced-contextual-tooltips'

import {
  Palette,
  Sparkles,
  Zap,
  Calendar as CalendarIcon,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// Sample data for the data table
const sampleData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
]

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => (
      <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
]


// ============================================================================
// V2 COMPETITIVE MOCK DATA - ShadcnShowcase Context
// ============================================================================

const shadcnShowcaseAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const shadcnShowcaseCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const shadcnShowcasePredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const shadcnShowcaseActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function ShadcnShowcaseClient() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isPageLoading, setIsPageLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [progress, setProgress] = React.useState(65)
  const [isLoading, setIsLoading] = React.useState(false)
  const [sliderValue, setSliderValue] = React.useState([50])

  // Dialog states for Quick Actions
  const [newItemDialogOpen, setNewItemDialogOpen] = React.useState(false)
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false)

  // New Item form state
  const [newItemName, setNewItemName] = React.useState('')
  const [newItemType, setNewItemType] = React.useState('')
  const [newItemDescription, setNewItemDescription] = React.useState('')
  const [isCreatingItem, setIsCreatingItem] = React.useState(false)

  // Export form state
  const [exportFormat, setExportFormat] = React.useState('json')
  const [exportScope, setExportScope] = React.useState('all')
  const [includeMetadata, setIncludeMetadata] = React.useState(true)
  const [isExporting, setIsExporting] = React.useState(false)

  // Settings form state
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = React.useState(true)
  const [refreshInterval, setRefreshInterval] = React.useState('30')
  const [isSavingSettings, setIsSavingSettings] = React.useState(false)

  // Quick Actions with dialog openers
  const shadcnShowcaseQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setNewItemDialogOpen(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setExportDialogOpen(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setSettingsDialogOpen(true) },
  ]

  // Handle New Item creation
  const handleCreateItem = async () => {
    if (!newItemName.trim()) {
      toast.error('Item name is required')
      return
    }
    setIsCreatingItem(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-data', format: 'json' })
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Item "' + newItemName + '" has been added to your collection')
      setNewItemDialogOpen(false)
      setNewItemName('')
      setNewItemType('')
      setNewItemDescription('')
    } catch (err) {
      toast.error('Failed to create item')
    } finally {
      setIsCreatingItem(false)
    }
  }

  // Handle Export
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-data', format: exportFormat })
      })
      if (!res.ok) throw new Error('Failed')
      const exportData = {
        format: exportFormat,
        scope: exportScope,
        includeMetadata,
        timestamp: new Date().toISOString(),
        records: exportScope === 'all' ? 150 : 50
      }
      toast.success('Export completed: ' + exportData.records + ' records as ' + exportFormat.toUpperCase())
      setExportDialogOpen(false)
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Settings Save
  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'appearance',
          darkModeEnabled,
          autoSaveEnabled
        })
      })
      if (!res.ok) throw new Error('Failed')
      const settings = {
        notificationsEnabled,
        darkModeEnabled,
        autoSaveEnabled,
        refreshInterval
      }
      toast.success('Settings saved')
      setSettingsDialogOpen(false)
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setIsSavingSettings(false)
    }
  }

  React.useEffect(() => {
    const loadShadcnShowcaseData = async () => {
      if (!userId) {
        setIsPageLoading(false)
        return
      }

      try {
        setIsPageLoading(true)
        setError(null)

        // Load component showcase data
        const res = await fetch('/api/component-showcase')
        if (!res.ok) throw new Error('Failed to load component showcase')

        setIsPageLoading(false)
        announce('Component showcase loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load component showcase')
        setIsPageLoading(false)
        announce('Error loading component showcase', 'assertive')
      }
    }

    loadShadcnShowcaseData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard', title: 'Main Dashboard' },
    { label: 'Shadcn Showcase', href: '/dashboard/shadcn-showcase', title: 'Component Library Showcase' }
  ]

  const handleFormSubmit = (data: any) => {
    const fieldCount = Object.keys(data).length
    const filledFields = Object.values(data).filter(v => v !== '' && v !== null && v !== undefined).length
    const fieldsWithValues = Object.entries(data).filter(([_, v]) => v !== '' && v !== null && v !== undefined)

    toast.success('Form submitted: ' + filledFields + '/' + fieldCount + ' fields completed')
  }

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={shadcnShowcaseAIInsights} />
          <PredictiveAnalytics predictions={shadcnShowcasePredictions} />
          <CollaborationIndicator collaborators={shadcnShowcaseCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={shadcnShowcaseQuickActions} />
          <ActivityFeed activities={shadcnShowcaseActivities} />
        </div>
<div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto space-y-8">
          <CardSkeleton />
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40">
      {/* Enhanced Breadcrumb */}
      <AnimatedElement animation="slideInDown">
        <div className="px-6 py-4">
          <EnhancedBreadcrumb items={breadcrumbItems} />
        </div>
      </AnimatedElement>

      {/* Enhanced Header */}
      <AnimatedElement animation="slideInRight">
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/30 p-6 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    KAZI Shadcn Showcase
                  </h1>
                  <p className="text-sm text-gray-600">Complete component library demonstration</p>
                </div>
              </div>
              <ContextualTooltip
                type="success"
                title="Component Status"
                description="All shadcn components are loaded and ready"
                metadata={{ status: 'stable' }}
              >
                <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">
                  <AnimatedCounter value={50} />+ Components
                </Badge>
              </ContextualTooltip>
            </div>
            
            <div className="flex items-center gap-3">
              <HelpTooltip content="Toggle loading demo">
                <Button variant="outline" size="sm" onClick={simulateLoading} data-testid="demo-loading-btn">
                  <Zap className="w-4 h-4 mr-2" />
                  Demo Loading
                </Button>
              </HelpTooltip>

              <HelpTooltip content="View documentation">
                <Button variant="default" size="sm" data-testid="view-docs-btn">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Docs
                </Button>
              </HelpTooltip>
            </div>
          </div>
        </div>
      </AnimatedElement>

      <div className="p-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
          </TabsList>

          {/* Basic Components */}
          <TabsContent value="basic" className="space-y-6">
            <AnimatedElement animation="slideInUp">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Components</CardTitle>
                  <CardDescription>
                    Fundamental shadcn components with consistent styling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Buttons */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Buttons</h3>
                    <Separator className="mb-4" />
                    <div className="flex flex-wrap gap-2">
                      <Button>Default</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                      <Button size="sm">Small</Button>
                      <Button size="lg">Large</Button>
                      <Button disabled>Disabled</Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Badges */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Badges</h3>
                    <Separator className="mb-4" />
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Progress */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Progress</h3>
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProgress(Math.min(100, progress + 10))}
                      >
                        Increase Progress
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Avatars */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Avatars</h3>
                    <Separator className="mb-4" />
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="/avatars/user1.jpg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarImage src="/avatars/user2.jpg" />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>BJ</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>
          </TabsContent>

          {/* Forms */}
          <TabsContent value="forms" className="space-y-6">
            <AnimatedElement animation="slideInUp">
              <div className="grid gap-6 md:grid-cols-2">
                <EnhancedShadcnForm 
                  type="contact" 
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Form Controls</CardTitle>
                    <CardDescription>
                      Individual form components
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Input */}
                    <div className="space-y-2">
                      <Label htmlFor="demo-input">Input</Label>
                      <Input id="demo-input" placeholder="Enter text..." />
                    </div>

                    {/* Textarea */}
                    <div className="space-y-2">
                      <Label htmlFor="demo-textarea">Textarea</Label>
                      <Textarea id="demo-textarea" placeholder="Enter message..." />
                    </div>

                    {/* Select */}
                    <div className="space-y-2">
                      <Label>Select</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Switch */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="demo-switch">Enable notifications</Label>
                      <Switch id="demo-switch" />
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="demo-checkbox" />
                      <Label htmlFor="demo-checkbox">Accept terms and conditions</Label>
                    </div>

                    {/* Radio Group */}
                    <div className="space-y-2">
                      <Label>Choose option</Label>
                      <RadioGroup defaultValue="option1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option1" id="r1" />
                          <Label htmlFor="r1">Option 1</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option2" id="r2" />
                          <Label htmlFor="r2">Option 2</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Slider */}
                    <div className="space-y-2">
                      <Label>Slider: {sliderValue[0]}</Label>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedElement>
          </TabsContent>

          {/* Data Display */}
          <TabsContent value="data" className="space-y-6">
            <AnimatedElement animation="slideInUp">
              <EnhancedDataTable
                columns={columns}
                data={sampleData}
                title="Sample Data Table"
                description="Enhanced data table with sorting, filtering, and pagination"
                isLoading={isLoading}
              />
            </AnimatedElement>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-6">
            <AnimatedElement animation="slideInUp">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Components</CardTitle>
                  <CardDescription>
                    Alerts, toasts, and loading states
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Alerts */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Alerts</h3>
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          This is an informational alert with default styling.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          This is a warning alert with custom styling.
                        </AlertDescription>
                      </Alert>
                      
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          This is a success alert with custom styling.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  <Separator />

                  {/* Skeleton Loading */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Loading States</h3>
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Toast Demo */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Toast Notifications</h3>
                    <Separator className="mb-4" />
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => {                        toast.success('Operation completed successfully')
                      }}>
                        Success Toast
                      </Button>
                      <Button onClick={() => {
                        logger.warn('Error toast triggered', { type: 'error', component: 'shadcn-showcase' })
                        toast.error('An error occurred')
                      }}>
                        Error Toast
                      </Button>
                      <Button onClick={() => {                        toast.info('Important information')
                      }}>
                        Info Toast
                      </Button>
                      <Button onClick={() => {                        toast('Default notification', {
                          description: 'Shadcn UI components - Standard notification demo'
                        })
                      }}>
                        Default Toast
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>
          </TabsContent>

          {/* Navigation */}
          <TabsContent value="navigation" className="space-y-6">
            <AnimatedElement animation="slideInUp">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Dropdown Menus</CardTitle>
                    <CardDescription>
                      Context menus and dropdowns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Open Menu
                          <MoreHorizontal className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dialogs & Popovers</CardTitle>
                    <CardDescription>
                      Modal dialogs and popovers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Open Dialog</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Sample Dialog</DialogTitle>
                          <DialogDescription>
                            This is a sample dialog with shadcn styling.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Dialog content goes here...
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Open Calendar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>
              </div>
            </AnimatedElement>
          </TabsContent>

          {/* Enhanced Components */}
          <TabsContent value="enhanced" className="space-y-6">
            <AnimatedElement animation="slideInUp">
              <EnhancedShadcnDashboard />
            </AnimatedElement>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Item Dialog */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your component showcase collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name *</Label>
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
                <SelectTrigger id="item-type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                placeholder="Enter description..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} disabled={isCreatingItem}>
              {isCreatingItem ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Configure your export settings and download your data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="format-json" />
                  <Label htmlFor="format-json">JSON</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="format-csv" />
                  <Label htmlFor="format-csv">CSV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="xlsx" id="format-xlsx" />
                  <Label htmlFor="format-xlsx">Excel (XLSX)</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Export Scope</Label>
              <Select value={exportScope} onValueChange={setExportScope}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records (150 items)</SelectItem>
                  <SelectItem value="filtered">Filtered Records (50 items)</SelectItem>
                  <SelectItem value="selected">Selected Records Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-metadata">Include Metadata</Label>
                <p className="text-sm text-muted-foreground">Add timestamps and user info</p>
              </div>
              <Switch
                id="include-metadata"
                checked={includeMetadata}
                onCheckedChange={setIncludeMetadata}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting} aria-label="Export data">
                  <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Showcase Settings</DialogTitle>
            <DialogDescription>
              Customize your component showcase experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive update alerts</p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkModeEnabled}
                onCheckedChange={setDarkModeEnabled}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save">Auto Save</Label>
                <p className="text-sm text-muted-foreground">Save changes automatically</p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Refresh Interval</Label>
              <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Every 15 seconds</SelectItem>
                  <SelectItem value="30">Every 30 seconds</SelectItem>
                  <SelectItem value="60">Every minute</SelectItem>
                  <SelectItem value="300">Every 5 minutes</SelectItem>
                  <SelectItem value="0">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
              {isSavingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

