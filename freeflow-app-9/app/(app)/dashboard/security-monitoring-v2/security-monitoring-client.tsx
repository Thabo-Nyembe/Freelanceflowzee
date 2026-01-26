'use client'

/**
 * Security Monitoring Client
 *
 * Comprehensive security monitoring dashboard with:
 * - Real-time alerts and event monitoring
 * - Anomaly detection rule management
 * - Threat analysis and investigation tools
 * - Security metrics and reporting
 */

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Activity,
  Eye,
  Settings,
  Plus,
  Search,
  RefreshCw,
  Clock,
  MapPin,
  User,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  ChevronRight,
  MoreVertical,
  Bell,
  Zap,
  Target,
  Trash2,
  Edit,
  Info,
  History,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useSecurityMonitoring,
  type AnomalyRule,
  type AlertSeverity,
  type AlertStatus,
} from '@/lib/hooks/use-security-monitoring'

// Helper function for time ago
function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Format date
function formatDate(date: string): string {
  return new Date(date).toLocaleString()
}

export default function SecurityMonitoringClient() {
  const {
    events,
    alerts,
    rules,
    alertStats,
    selectedAlert,
    isLoading,
    error,
    fetchEvents,
    fetchAlerts,
    fetchAlert,
    updateAlertStatus,
    createManualAlert,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    getSeverityColor,
    getStatusColor,
    clearError,
  } = useSecurityMonitoring()

  const [activeTab, setActiveTab] = useState('overview')
  const [eventFilter, setEventFilter] = useState({ type: '', minRisk: 0 })
  const [alertFilter, setAlertFilter] = useState({ status: 'open', severity: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [showAlertDetailDialog, setShowAlertDetailDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AnomalyRule | null>(null)
  const [newAlert, setNewAlert] = useState({
    alert_type: 'manual_report',
    severity: 'medium' as AlertSeverity,
    title: '',
    description: '',
  })
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    rule_type: 'threshold',
    severity: 'medium' as AlertSeverity,
    conditions: [{ field: '', operator: 'equals', value: '' }],
    actions: [{ type: 'create_alert' }],
    is_active: true,
    cooldown_minutes: 15,
  })

  // Load initial data
  useEffect(() => {
    fetchAlerts({ status: 'open' })
    fetchEvents({ limit: 100 })
    fetchRules()
  }, [fetchAlerts, fetchEvents, fetchRules])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAlerts({ status: alertFilter.status as AlertStatus | 'open' })
      fetchEvents({ limit: 100 })
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, alertFilter.status, fetchAlerts, fetchEvents])

  // Severity badge component
  const SeverityBadge = ({ severity }: { severity: AlertSeverity }) => {
    const variants: Record<AlertSeverity, { className: string; icon: React.ReactNode }> = {
      critical: { className: 'bg-red-500 text-white', icon: <AlertCircle className="w-3 h-3" /> },
      high: { className: 'bg-orange-500 text-white', icon: <AlertTriangle className="w-3 h-3" /> },
      medium: { className: 'bg-yellow-500 text-black', icon: <Info className="w-3 h-3" /> },
      low: { className: 'bg-blue-500 text-white', icon: <Shield className="w-3 h-3" /> },
    }
    const { className, icon } = variants[severity]
    return (
      <Badge className={`${className} flex items-center gap-1`}>
        {icon}
        {severity.toUpperCase()}
      </Badge>
    )
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: AlertStatus }) => {
    const variants: Record<AlertStatus, { className: string; icon: React.ReactNode }> = {
      new: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <Bell className="w-3 h-3" /> },
      investigating: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: <Eye className="w-3 h-3" /> },
      resolved: { className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: <CheckCircle className="w-3 h-3" /> },
      false_positive: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: <XCircle className="w-3 h-3" /> },
    }
    const { className, icon } = variants[status]
    return (
      <Badge variant="outline" className={`${className} flex items-center gap-1`}>
        {icon}
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  // Risk score indicator
  const RiskIndicator = ({ score }: { score: number }) => {
    const getColor = () => {
      if (score >= 80) return 'text-red-500'
      if (score >= 60) return 'text-orange-500'
      if (score >= 40) return 'text-yellow-500'
      return 'text-green-500'
    }
    return (
      <div className="flex items-center gap-2">
        <div className={`font-bold ${getColor()}`}>{score}</div>
        <Progress value={score} className="w-16 h-2" />
      </div>
    )
  }

  // Handle alert status update
  const handleUpdateAlertStatus = async (alertId: string, status: AlertStatus) => {
    const success = await updateAlertStatus(alertId, status)
    if (success) {
      fetchAlerts({ status: alertFilter.status as AlertStatus | 'open' })
    }
  }

  // Handle create manual alert
  const handleCreateAlert = async () => {
    if (!newAlert.title) {
      toast.error('Please enter an alert title')
      return
    }
    const alertId = await createManualAlert(newAlert)
    if (alertId) {
      setShowAlertDialog(false)
      setNewAlert({
        alert_type: 'manual_report',
        severity: 'medium',
        title: '',
        description: '',
      })
      fetchAlerts({ status: alertFilter.status as AlertStatus | 'open' })
    }
  }

  // Handle create/update rule
  const handleSaveRule = async () => {
    if (!newRule.name) {
      toast.error('Please enter a rule name')
      return
    }

    if (editingRule) {
      const success = await updateRule(editingRule.id, newRule)
      if (success) {
        setShowRuleDialog(false)
        setEditingRule(null)
        resetRuleForm()
      }
    } else {
      const ruleId = await createRule({
        organization_id: '', // Will be filled by API
        ...newRule,
      })
      if (ruleId) {
        setShowRuleDialog(false)
        resetRuleForm()
      }
    }
  }

  // Reset rule form
  const resetRuleForm = () => {
    setNewRule({
      name: '',
      description: '',
      rule_type: 'threshold',
      severity: 'medium',
      conditions: [{ field: '', operator: 'equals', value: '' }],
      actions: [{ type: 'create_alert' }],
      is_active: true,
      cooldown_minutes: 15,
    })
  }

  // Handle delete rule
  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return
    await deleteRule(ruleId)
  }

  // View alert details
  const viewAlertDetails = async (alertId: string) => {
    await fetchAlert(alertId)
    setShowAlertDetailDialog(true)
  }

  // Filter events by search
  const filteredEvents = events.filter(event => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        event.event_type.toLowerCase().includes(query) ||
        event.ip_address.includes(query) ||
        event.user_agent.toLowerCase().includes(query)
      )
    }
    if (eventFilter.type && event.event_type !== eventFilter.type) return false
    if (eventFilter.minRisk && event.risk_score < eventFilter.minRisk) return false
    return true
  })

  // Filter alerts by search
  const filteredAlerts = alerts.filter(alert => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.alert_type.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query)
      )
    }
    if (alertFilter.severity && alert.severity !== alertFilter.severity) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Security Monitoring
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Real-time threat detection and anomaly analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto-refresh ({refreshInterval}s)
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchAlerts({ status: alertFilter.status as AlertStatus | 'open' })
                fetchEvents({ limit: 100 })
                toast.success('Data refreshed')
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Security Incident</DialogTitle>
                  <DialogDescription>
                    Manually create a security alert for investigation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Alert Type</Label>
                    <Select
                      value={newAlert.alert_type}
                      onValueChange={(v) => setNewAlert({ ...newAlert, alert_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual_report">Manual Report</SelectItem>
                        <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                        <SelectItem value="policy_violation">Policy Violation</SelectItem>
                        <SelectItem value="data_breach">Data Breach</SelectItem>
                        <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={newAlert.severity}
                      onValueChange={(v) => setNewAlert({ ...newAlert, severity: v as AlertSeverity })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newAlert.title}
                      onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                      placeholder="Brief description of the incident"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newAlert.description}
                      onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                      placeholder="Detailed information about what was observed..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAlert}>
                    Create Alert
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Critical Alerts</p>
                  <p className="text-3xl font-bold">{alertStats?.critical_alerts || 0}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-200" />
              </div>
              <div className="mt-2 text-red-100 text-sm">
                Requires immediate attention
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Open Alerts</p>
                  <p className="text-3xl font-bold">
                    {(alertStats?.new_alerts || 0) + (alertStats?.investigating_alerts || 0)}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-200" />
              </div>
              <div className="mt-2 text-orange-100 text-sm">
                {alertStats?.new_alerts || 0} new, {alertStats?.investigating_alerts || 0} investigating
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Events (24h)</p>
                  <p className="text-3xl font-bold">{events.length}</p>
                </div>
                <Activity className="w-10 h-10 text-blue-200" />
              </div>
              <div className="mt-2 text-blue-100 text-sm">
                Security events recorded
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Resolved</p>
                  <p className="text-3xl font-bold">{alertStats?.resolved_alerts || 0}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
              <div className="mt-2 text-green-100 text-sm">
                Alerts resolved this month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
              {(alertStats?.new_alerts || 0) > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {alertStats?.new_alerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="threats" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Threat Intel
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Alerts
                  </CardTitle>
                  <CardDescription>Latest security alerts requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {alerts.slice(0, 10).map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => viewAlertDetails(alert.id)}
                        >
                          <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{alert.title}</h4>
                              <SeverityBadge severity={alert.severity} />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo(alert.created_at)}
                              </span>
                              <StatusBadge status={alert.status} />
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      ))}
                      {alerts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No alerts to display</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Events
                  </CardTitle>
                  <CardDescription>Latest security events with risk scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {events.slice(0, 15).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              event.risk_score >= 70 ? 'bg-red-100 text-red-600' :
                              event.risk_score >= 40 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {event.event_type.includes('login') ? (
                                <Lock className="w-4 h-4" />
                              ) : event.event_type.includes('api') ? (
                                <Zap className="w-4 h-4" />
                              ) : (
                                <Activity className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {event.event_type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {event.ip_address} • {timeAgo(event.timestamp)}
                              </p>
                            </div>
                          </div>
                          <RiskIndicator score={event.risk_score} />
                        </div>
                      ))}
                      {events.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No events to display</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Alert Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Alert Distribution
                </CardTitle>
                <CardDescription>Breakdown of alerts by severity and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {alertStats?.critical_alerts || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                    <Progress value={((alertStats?.critical_alerts || 0) / Math.max(alertStats?.total_alerts || 1, 1)) * 100} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {alertStats?.high_alerts || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
                    <Progress value={((alertStats?.high_alerts || 0) / Math.max(alertStats?.total_alerts || 1, 1)) * 100} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {alertStats?.medium_alerts || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Medium</p>
                    <Progress value={((alertStats?.medium_alerts || 0) / Math.max(alertStats?.total_alerts || 1, 1)) * 100} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {alertStats?.low_alerts || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Low</p>
                    <Progress value={((alertStats?.low_alerts || 0) / Math.max(alertStats?.total_alerts || 1, 1)) * 100} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security Alerts</CardTitle>
                    <CardDescription>Manage and investigate security alerts</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      value={alertFilter.status}
                      onValueChange={(v) => {
                        setAlertFilter({ ...alertFilter, status: v })
                        fetchAlerts({ status: v as AlertStatus | 'open' })
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="false_positive">False Positive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={alertFilter.severity}
                      onValueChange={(v) => setAlertFilter({ ...alertFilter, severity: v })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search alerts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Alert</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <SeverityBadge severity={alert.severity} />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{alert.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {alert.alert_type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={alert.status} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">{timeAgo(alert.created_at)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewAlertDetails(alert.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleUpdateAlertStatus(alert.id, 'investigating')}>
                                <Eye className="w-4 h-4 mr-2" />
                                Start Investigation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateAlertStatus(alert.id, 'resolved')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateAlertStatus(alert.id, 'false_positive')}>
                                <XCircle className="w-4 h-4 mr-2" />
                                False Positive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No alerts found</p>
                    <p className="text-sm">Alerts matching your filters will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security Events</CardTitle>
                    <CardDescription>All security events with risk analysis</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      value={eventFilter.type}
                      onValueChange={(v) => setEventFilter({ ...eventFilter, type: v })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Event Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="login_attempt">Login Attempt</SelectItem>
                        <SelectItem value="login_success">Login Success</SelectItem>
                        <SelectItem value="login_failure">Login Failure</SelectItem>
                        <SelectItem value="password_change">Password Change</SelectItem>
                        <SelectItem value="api_call">API Call</SelectItem>
                        <SelectItem value="data_export">Data Export</SelectItem>
                        <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={String(eventFilter.minRisk)}
                      onValueChange={(v) => setEventFilter({ ...eventFilter, minRisk: parseInt(v) })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Min Risk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">All Risk Levels</SelectItem>
                        <SelectItem value="40">Medium+ (40+)</SelectItem>
                        <SelectItem value="60">High+ (60+)</SelectItem>
                        <SelectItem value="80">Critical (80+)</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Risk</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <RiskIndicator score={event.risk_score} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {event.event_type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {event.ip_address}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{event.location?.city || event.location?.country || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-gray-500">
                          {event.user_agent}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="text-sm text-gray-500">
                                {timeAgo(event.timestamp)}
                              </TooltipTrigger>
                              <TooltipContent>
                                {formatDate(event.timestamp)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No events found</p>
                    <p className="text-sm">Events matching your filters will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Anomaly Detection Rules</CardTitle>
                    <CardDescription>Configure rules for automatic threat detection</CardDescription>
                  </div>
                  <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingRule(null); resetRuleForm(); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Rule
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingRule ? 'Edit Rule' : 'Create Detection Rule'}
                        </DialogTitle>
                        <DialogDescription>
                          Define conditions that will trigger security alerts
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Rule Name</Label>
                            <Input
                              value={newRule.name}
                              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                              placeholder="e.g., High Rate API Calls"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rule Type</Label>
                            <Select
                              value={newRule.rule_type}
                              onValueChange={(v) => setNewRule({ ...newRule, rule_type: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="threshold">Threshold</SelectItem>
                                <SelectItem value="pattern">Pattern</SelectItem>
                                <SelectItem value="behavioral">Behavioral</SelectItem>
                                <SelectItem value="geo">Geographic</SelectItem>
                                <SelectItem value="time_based">Time-based</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newRule.description}
                            onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                            placeholder="Describe what this rule detects..."
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Severity</Label>
                            <Select
                              value={newRule.severity}
                              onValueChange={(v) => setNewRule({ ...newRule, severity: v as AlertSeverity })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Cooldown (minutes)</Label>
                            <Input
                              type="number"
                              value={newRule.cooldown_minutes}
                              onChange={(e) => setNewRule({ ...newRule, cooldown_minutes: parseInt(e.target.value) || 15 })}
                              min={1}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Conditions</Label>
                          {newRule.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                placeholder="Field"
                                value={condition.field}
                                onChange={(e) => {
                                  const newConditions = [...newRule.conditions]
                                  newConditions[index].field = e.target.value
                                  setNewRule({ ...newRule, conditions: newConditions })
                                }}
                                className="flex-1"
                              />
                              <Select
                                value={condition.operator}
                                onValueChange={(v) => {
                                  const newConditions = [...newRule.conditions]
                                  newConditions[index].operator = v
                                  setNewRule({ ...newRule, conditions: newConditions })
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="not_equals">Not Equals</SelectItem>
                                  <SelectItem value="greater_than">Greater Than</SelectItem>
                                  <SelectItem value="less_than">Less Than</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="regex">Regex</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Value"
                                value={String(condition.value)}
                                onChange={(e) => {
                                  const newConditions = [...newRule.conditions]
                                  newConditions[index].value = e.target.value
                                  setNewRule({ ...newRule, conditions: newConditions })
                                }}
                                className="flex-1"
                              />
                              {newRule.conditions.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setNewRule({
                                      ...newRule,
                                      conditions: newRule.conditions.filter((_, i) => i !== index)
                                    })
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNewRule({
                              ...newRule,
                              conditions: [...newRule.conditions, { field: '', operator: 'equals', value: '' }]
                            })}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Condition
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="rule-active"
                            checked={newRule.is_active}
                            onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
                          />
                          <Label htmlFor="rule-active">Rule is active</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveRule}>
                          {editingRule ? 'Update Rule' : 'Create Rule'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          rule.is_active
                            ? getSeverityColor(rule.severity)
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {rule.is_system ? (
                            <Lock className="w-4 h-4 text-white" />
                          ) : (
                            <Zap className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            {rule.is_system && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                            <SeverityBadge severity={rule.severity} />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {rule.description}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <span>Type: {rule.rule_type}</span>
                            <span>Cooldown: {rule.cooldown_minutes}min</span>
                            <span>{rule.conditions.length} condition(s)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={async (checked) => {
                            await updateRule(rule.id, { is_active: checked })
                          }}
                          disabled={rule.is_system}
                        />
                        {!rule.is_system && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingRule(rule)
                                setNewRule({
                                  name: rule.name,
                                  description: rule.description,
                                  rule_type: rule.rule_type,
                                  severity: rule.severity,
                                  conditions: rule.conditions,
                                  actions: rule.actions,
                                  is_active: rule.is_active,
                                  cooldown_minutes: rule.cooldown_minutes,
                                })
                                setShowRuleDialog(true)
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteRule(rule.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                  {rules.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No rules configured</p>
                      <p className="text-sm">Create rules to automatically detect security threats</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threat Intelligence Tab */}
          <TabsContent value="threats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Geographic Analysis
                  </CardTitle>
                  <CardDescription>Login attempts by country</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Geographic login data */}
                    {[
                      { country: 'United States', code: 'US', logins: 1247, percentage: 45, flag: '🇺🇸', trend: '+12%', safe: true },
                      { country: 'United Kingdom', code: 'GB', logins: 423, percentage: 15, flag: '🇬🇧', trend: '+5%', safe: true },
                      { country: 'Germany', code: 'DE', logins: 312, percentage: 11, flag: '🇩🇪', trend: '+8%', safe: true },
                      { country: 'Canada', code: 'CA', logins: 287, percentage: 10, flag: '🇨🇦', trend: '+3%', safe: true },
                      { country: 'Australia', code: 'AU', logins: 198, percentage: 7, flag: '🇦🇺', trend: '+2%', safe: true },
                      { country: 'Unknown VPN', code: 'VPN', logins: 89, percentage: 3, flag: '🛡️', trend: '-15%', safe: false },
                    ].map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{location.flag}</span>
                          <div>
                            <p className="font-medium">{location.country}</p>
                            <p className="text-sm text-gray-500">{location.logins.toLocaleString()} logins</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${location.safe ? 'bg-green-500' : 'bg-orange-500'}`}
                              style={{ width: `${location.percentage}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${location.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {location.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total logins (30 days): 2,556</span>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        97% from trusted locations
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Blocked IPs
                  </CardTitle>
                  <CardDescription>IP addresses blocked due to suspicious activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* This would be populated with blocked IP data */}
                    <div className="text-center py-8 text-gray-500">
                      <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No blocked IPs</p>
                      <p className="text-sm">IPs flagged for suspicious activity will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Threat Timeline
                </CardTitle>
                <CardDescription>Recent security threats and mitigations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts
                    .filter(a => a.severity === 'critical' || a.severity === 'high')
                    .slice(0, 5)
                    .map((alert) => (
                      <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <SeverityBadge severity={alert.severity} />
                            <StatusBadge status={alert.status} />
                          </div>
                          <p className="text-sm text-gray-500">{alert.description}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(alert.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No high severity threats</p>
                      <p className="text-sm">High and critical threats will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alert Detail Dialog */}
        <Dialog open={showAlertDetailDialog} onOpenChange={setShowAlertDetailDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Alert Details
                {selectedAlert && <SeverityBadge severity={selectedAlert.severity} />}
              </DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedAlert.title}</h3>
                  <p className="text-gray-500 mt-1">{selectedAlert.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedAlert.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Alert Type</Label>
                    <p className="mt-1">{selectedAlert.alert_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Created</Label>
                    <p className="mt-1">{formatDate(selectedAlert.created_at)}</p>
                  </div>
                  {selectedAlert.resolved_at && (
                    <div>
                      <Label className="text-gray-500">Resolved</Label>
                      <p className="mt-1">{formatDate(selectedAlert.resolved_at)}</p>
                    </div>
                  )}
                </div>

                {selectedAlert.user && (
                  <div>
                    <Label className="text-gray-500">Associated User</Label>
                    <div className="flex items-center gap-3 mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <User className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium">{selectedAlert.user.name}</p>
                        <p className="text-sm text-gray-500">{selectedAlert.user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {Object.keys(selectedAlert.details).length > 0 && (
                  <div>
                    <Label className="text-gray-500">Details</Label>
                    <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedAlert.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'investigating')}
                      disabled={selectedAlert.status === 'investigating'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Investigate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'resolved')}
                      disabled={selectedAlert.status === 'resolved'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'false_positive')}
                      disabled={selectedAlert.status === 'false_positive'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      False Positive
                    </Button>
                  </div>
                  <Button variant="ghost" onClick={() => setShowAlertDetailDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
            <Button variant="ghost" size="sm" onClick={clearError} className="text-white hover:text-white/80">
              ×
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
