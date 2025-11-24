'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  Users,
  Server,
  FileText,
  BarChart3,
  Lock,
  CreditCard,
  Settings,
  Search,
  Plus,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Key,
  LayoutGrid,
  Bell,
  Cpu,
  HardDrive,
  Activity,
  UserPlus,
  UserMinus,
  UserCheck,
  Eye,
  EyeOff,
  Edit,
  Trash,
  MoreHorizontal,
  Zap,
  Database
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function AdminPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState('7d')

  // A+++ LOAD ADMIN DATA
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load admin dashboard'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Admin dashboard loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin dashboard')
        setIsLoading(false)
        announce('Error loading admin dashboard', 'assertive')
      }
    }

    loadAdminData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 kazi-bg-light min-h-screen">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid gap-6 md:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
          <CardSkeleton />
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="p-6 space-y-6 kazi-bg-light min-h-screen">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 kazi-bg-light min-h-screen">
      <PageHeader
        title="Admin Dashboard"
        description="System administration and management"
        icon={Shield}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin' }
        ]}
      />

      {/* Admin Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="kazi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,284</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+12% from last month</span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="kazi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">98%</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">All systems operational</span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Server className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="kazi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">$47,392</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+8% from last month</span>
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="kazi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">342</p>
                <div className="flex items-center mt-1">
                  <Activity className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-500">Currently online</span>
                </div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Activity className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="kazi-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Administration</CardTitle>
              <CardDescription>Manage platform settings and configurations</CardDescription>
            </div>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="p-3 rounded-full bg-blue-100 mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage users, roles, and permissions
              </p>
              <Button variant="outline">Manage Users</Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="p-3 rounded-full bg-green-100 mb-4">
                <Server className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">System Health</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor system performance and health
              </p>
              <Button variant="outline">View Status</Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="p-3 rounded-full bg-purple-100 mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Platform usage and performance analytics
              </p>
              <Button variant="outline">View Analytics</Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="p-3 rounded-full bg-red-100 mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Security</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Security settings and audit logs
              </p>
              <Button variant="outline">Security Center</Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="p-3 rounded-full bg-yellow-100 mb-4">
                <CreditCard className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Billing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revenue and subscription management
              </p>
              <Button variant="outline">Billing Dashboard</Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="p-3 rounded-full bg-indigo-100 mb-4">
                <Settings className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Platform settings and feature flags
              </p>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="kazi-card">
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
          <CardDescription>Latest administrative actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <UserPlus className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">New user registered:</span>{' '}
                  <span>john.doe@example.com</span>
                </p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">System backup completed</span>
                </p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">High CPU usage detected</span>{' '}
                  <span className="text-muted-foreground">- Server 1</span>
                </p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Payment processed:</span>{' '}
                  <span>$299 subscription renewal</span>
                </p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Lock className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Security alert:</span>{' '}
                  <span className="text-muted-foreground">Multiple failed login attempts</span>
                </p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </CardFooter>
      </Card>

      {/* Coming Soon Features */}
      <Card className="kazi-card">
        <CardHeader>
          <CardTitle>Advanced Admin Features Coming Soon</CardTitle>
          <CardDescription>
            Enhanced administration tools in development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <div className="p-3 rounded-full bg-blue-100 mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1">Automated Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered system monitoring and alerts
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <div className="p-3 rounded-full bg-purple-100 mb-4">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-1">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Deep insights into platform usage and performance
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <div className="p-3 rounded-full bg-green-100 mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-1">Multi-tenant Management</h3>
              <p className="text-sm text-muted-foreground">
                Advanced multi-organization management tools
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button>
            Join Admin Beta Program
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
