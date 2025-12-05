'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
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

  // Admin dialogs state
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isMonitoringDialogOpen, setIsMonitoringDialogOpen] = useState(false)
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false)
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false)

  // Mock data for advanced features
  const [systemMetrics] = useState({
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 78,
    uptime: '99.9%',
    lastIncident: '15 days ago'
  })

  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active', lastLogin: '5 hours ago' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor', status: 'inactive', lastLogin: '3 days ago' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'active', lastLogin: '1 day ago' }
  ])

  const [securityEvents] = useState([
    { id: 1, type: 'login_success', user: 'john@example.com', ip: '192.168.1.1', time: '5 min ago' },
    { id: 2, type: 'login_failed', user: 'unknown@spam.com', ip: '203.0.113.45', time: '15 min ago' },
    { id: 3, type: 'password_changed', user: 'jane@example.com', ip: '10.0.0.5', time: '1 hour ago' },
    { id: 4, type: 'api_key_created', user: 'bob@example.com', ip: '172.16.0.10', time: '3 hours ago' }
  ])

  // Handlers
  const handleManageUser = useCallback((action: string, user?: any) => {
    if (action === 'edit' && user) {
      toast.info(`Editing ${user.name}`)
      announce(`Editing user ${user.name}`, 'polite')
    } else if (action === 'delete' && user) {
      toast.warning(`Removing ${user.name}`, { description: 'User will be deactivated' })
      announce(`Removing user ${user.name}`, 'polite')
    } else if (action === 'add') {
      toast.success('User invitation sent')
      announce('User invitation sent', 'polite')
    }
  }, [announce])

  const handleSecurityAction = useCallback((action: string) => {
    if (action === 'block') {
      toast.success('IP blocked successfully')
    } else if (action === 'audit') {
      toast.info('Generating audit report...')
    } else if (action === '2fa') {
      toast.success('2FA enforcement enabled')
    }
    announce(`Security action: ${action}`, 'polite')
  }, [announce])

  const handleBillingAction = useCallback((action: string) => {
    if (action === 'export') {
      toast.success('Exporting billing data...', { description: 'Download will start shortly' })
    } else if (action === 'refund') {
      toast.info('Refund request processed')
    }
    announce(`Billing action: ${action}`, 'polite')
  }, [announce])

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
            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md" onClick={() => setIsUserDialogOpen(true)}>
              <div className="p-3 rounded-full bg-blue-100 mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage users, roles, and permissions
              </p>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setIsUserDialogOpen(true) }}>Manage Users</Button>
            </div>

            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md" onClick={() => setIsMonitoringDialogOpen(true)}>
              <div className="p-3 rounded-full bg-green-100 mb-4">
                <Server className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">System Health</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor system performance and health
              </p>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setIsMonitoringDialogOpen(true) }}>View Status</Button>
            </div>

            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md" onClick={() => { toast.info('Analytics Dashboard', { description: 'View detailed platform analytics' }); announce('Opening analytics', 'polite') }}>
              <div className="p-3 rounded-full bg-purple-100 mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Platform usage and performance analytics
              </p>
              <Button variant="outline">View Analytics</Button>
            </div>

            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md" onClick={() => setIsSecurityDialogOpen(true)}>
              <div className="p-3 rounded-full bg-red-100 mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Security</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Security settings and audit logs
              </p>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setIsSecurityDialogOpen(true) }}>Security Center</Button>
            </div>

            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md" onClick={() => setIsBillingDialogOpen(true)}>
              <div className="p-3 rounded-full bg-yellow-100 mb-4">
                <CreditCard className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Billing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revenue and subscription management
              </p>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setIsBillingDialogOpen(true) }}>Billing Dashboard</Button>
            </div>

            <div className="flex flex-col items-center text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md" onClick={() => { toast.info('Configuration', { description: 'Platform settings updated' }); announce('Opening configuration', 'polite') }}>
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

      {/* Advanced Admin Features */}
      <Card className="kazi-card">
        <CardHeader>
          <CardTitle>Advanced Administration Tools</CardTitle>
          <CardDescription>
            Real-time monitoring and management capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* System Monitoring Card */}
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <Cpu className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Live System Metrics</h3>
                  <p className="text-xs text-muted-foreground">Real-time monitoring</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU</span>
                  <div className="flex items-center gap-2">
                    <Progress value={systemMetrics.cpu} className="w-20 h-2" />
                    <span className="text-xs font-medium">{systemMetrics.cpu}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory</span>
                  <div className="flex items-center gap-2">
                    <Progress value={systemMetrics.memory} className="w-20 h-2" />
                    <span className="text-xs font-medium">{systemMetrics.memory}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Disk</span>
                  <div className="flex items-center gap-2">
                    <Progress value={systemMetrics.disk} className="w-20 h-2" />
                    <span className="text-xs font-medium">{systemMetrics.disk}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-100">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Platform Analytics</h3>
                  <p className="text-xs text-muted-foreground">Key performance indicators</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xl font-bold text-purple-600">1.2K</div>
                  <div className="text-xs text-muted-foreground">Daily Active</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xl font-bold text-green-600">4.2s</div>
                  <div className="text-xs text-muted-foreground">Avg Load Time</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xl font-bold text-blue-600">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-xl font-bold text-orange-600">12ms</div>
                  <div className="text-xs text-muted-foreground">API Latency</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-100">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Quick Actions</h3>
                  <p className="text-xs text-muted-foreground">Common admin tasks</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { toast.success('Cache cleared'); announce('Cache cleared', 'polite') }}>
                  <HardDrive className="h-4 w-4 mr-2" />
                  Clear System Cache
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { toast.success('Backup started'); announce('Backup started', 'polite') }}>
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { toast.info('Sending test notification'); announce('Test notification sent', 'polite') }}>
                  <Bell className="h-4 w-4 mr-2" />
                  Test Notifications
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { toast.success('Health check passed'); announce('Health check completed', 'polite') }}>
                  <Activity className="h-4 w-4 mr-2" />
                  Run Health Check
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Management
            </DialogTitle>
            <DialogDescription>
              Manage platform users, roles, and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Input placeholder="Search users..." className="max-w-xs" />
              <Button onClick={() => handleManageUser('add')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.lastLogin}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleManageUser('edit', user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleManageUser('delete', user)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* System Monitoring Dialog */}
      <Dialog open={isMonitoringDialogOpen} onOpenChange={setIsMonitoringDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-green-600" />
              System Health Monitor
            </DialogTitle>
            <DialogDescription>
              Real-time system performance and health metrics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">CPU Usage</span>
                  <span className="text-lg font-bold text-blue-600">{systemMetrics.cpu}%</span>
                </div>
                <Progress value={systemMetrics.cpu} className="h-3" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Memory</span>
                  <span className="text-lg font-bold text-purple-600">{systemMetrics.memory}%</span>
                </div>
                <Progress value={systemMetrics.memory} className="h-3" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Disk Space</span>
                  <span className="text-lg font-bold text-green-600">{systemMetrics.disk}%</span>
                </div>
                <Progress value={systemMetrics.disk} className="h-3" />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Network</span>
                  <span className="text-lg font-bold text-orange-600">{systemMetrics.network}%</span>
                </div>
                <Progress value={systemMetrics.network} className="h-3" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-medium">All Systems Operational</div>
                <div className="text-sm text-muted-foreground">Uptime: {systemMetrics.uptime} | Last incident: {systemMetrics.lastIncident}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Center Dialog */}
      <Dialog open={isSecurityDialogOpen} onOpenChange={setIsSecurityDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Security Center
            </DialogTitle>
            <DialogDescription>
              Monitor security events and manage access controls
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSecurityAction('audit')}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Audit Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSecurityAction('2fa')}>
                <Key className="h-4 w-4 mr-2" />
                Enforce 2FA
              </Button>
            </div>
            <div className="border rounded-lg">
              <div className="px-4 py-3 bg-gray-50 font-medium text-sm">Recent Security Events</div>
              <div className="divide-y">
                {securityEvents.map(event => (
                  <div key={event.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${event.type.includes('failed') ? 'bg-red-100' : 'bg-green-100'}`}>
                        {event.type.includes('failed') ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{event.type.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground">{event.user} • {event.ip}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{event.time}</span>
                      {event.type.includes('failed') && (
                        <Button variant="ghost" size="sm" onClick={() => handleSecurityAction('block')}>
                          Block IP
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Billing Dashboard Dialog */}
      <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-yellow-600" />
              Billing Dashboard
            </DialogTitle>
            <DialogDescription>
              Revenue overview and subscription management
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">$47,392</div>
                <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">284</div>
                <div className="text-sm text-muted-foreground">Active Subscriptions</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">96.2%</div>
                <div className="text-sm text-muted-foreground">Retention Rate</div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Revenue by Plan</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pro Plan</span>
                  <div className="flex items-center gap-2">
                    <Progress value={65} className="w-32 h-2" />
                    <span className="text-sm font-medium">$30,804</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Business Plan</span>
                  <div className="flex items-center gap-2">
                    <Progress value={25} className="w-32 h-2" />
                    <span className="text-sm font-medium">$11,848</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enterprise</span>
                  <div className="flex items-center gap-2">
                    <Progress value={10} className="w-32 h-2" />
                    <span className="text-sm font-medium">$4,740</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleBillingAction('export')}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" onClick={() => handleBillingAction('refund')}>
                Process Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
