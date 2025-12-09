'use client'

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

const logger = createFeatureLogger('Shadcn-Showcase-Disabled')

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

export default function ShadcnShowcasePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [progress, setProgress] = React.useState(65)
  const [isLoading, setIsLoading] = React.useState(false)
  const [sliderValue, setSliderValue] = React.useState([50])

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard', title: 'Main Dashboard' },
    { label: 'Shadcn Showcase', href: '/dashboard/shadcn-showcase', title: 'Component Library Showcase' }
  ]

  const handleFormSubmit = (data: any) => {
    const fieldCount = Object.keys(data).length
    const filledFields = Object.values(data).filter(v => v !== '' && v !== null && v !== undefined).length

    logger.info('Form submitted successfully', {
      fieldCount,
      filledFields,
      formData: data
    })

    const fieldsWithValues = Object.entries(data).filter(([_, v]) => v !== '' && v !== null && v !== undefined)

    toast.success('Form submitted successfully', {
      description: `${filledFields}/${fieldCount} fields completed - ${fieldsWithValues.map(([k]) => k).join(', ')}`
    })
  }

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
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
                <Button variant="outline" size="sm" onClick={simulateLoading}>
                  <Zap className="w-4 h-4 mr-2" />
                  Demo Loading
                </Button>
              </HelpTooltip>
              
              <HelpTooltip content="View documentation">
                <Button variant="default" size="sm">
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
                      <Button onClick={() => {
                        logger.info('Success toast triggered', { type: 'success', component: 'shadcn-showcase-disabled' })
                        toast.success('Operation completed successfully', {
                          description: 'Shadcn UI components - Success notification demo - All systems operational'
                        })
                      }}>
                        Success Toast
                      </Button>
                      <Button onClick={() => {
                        logger.warn('Error toast triggered', { type: 'error', component: 'shadcn-showcase-disabled' })
                        toast.error('An error occurred', {
                          description: 'Shadcn UI components - Error notification demo - Please check your inputs'
                        })
                      }}>
                        Error Toast
                      </Button>
                      <Button onClick={() => {
                        logger.info('Info toast triggered', { type: 'info', component: 'shadcn-showcase-disabled' })
                        toast.info('Important information', {
                          description: 'Shadcn UI components - Info notification demo - Review the documentation for details'
                        })
                      }}>
                        Info Toast
                      </Button>
                      <Button onClick={() => {
                        logger.info('Default toast triggered', { type: 'default', component: 'shadcn-showcase-disabled' })
                        toast('Default notification', {
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
    </div>
  )
}
