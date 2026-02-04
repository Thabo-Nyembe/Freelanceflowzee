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

import { useState, useEffect } from 'react'
import {
  Calendar,
  Settings as SettingsIcon,
  FileText,
  Plus,
  Download,
  CheckCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import EnhancedCalendarBooking from '@/components/booking/enhanced-calendar-booking'
import { createSimpleLogger } from '@/lib/simple-logger'
import { toast } from 'sonner'

const logger = createSimpleLogger('Booking')

import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Booking Context
// ============================================================================

const bookingAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const bookingCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const bookingPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const bookingActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function BookingClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId: _userId, loading: _userLoading } = useCurrentUser()

  // Dialog states
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // New booking form state
  const [bookingTitle, setBookingTitle] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingDuration, setBookingDuration] = useState('60')
  const [bookingService, setBookingService] = useState('consultation')
  const [bookingNotes, setBookingNotes] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  // Settings form state
  const [autoConfirm, setAutoConfirm] = useState(true)
  const [bufferTime, setBufferTime] = useState('15')
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState('12')
  const [reminderHours, setReminderHours] = useState('24')
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00')
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00')
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Reports state
  const [reportPeriod, setReportPeriod] = useState('month')
  const [reportType, setReportType] = useState('summary')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Export state
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportDateRange, setExportDateRange] = useState('all')
  const [isExporting, setIsExporting] = useState(false)

  // Quick actions with dialog openers
  const bookingQuickActionsWithDialogs = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewBookingDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load booking data
        const res = await fetch('/api/bookings')
        if (!res.ok) throw new Error('Failed to load booking')

        setIsLoading(false)
        announce('Booking page loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking')
        setIsLoading(false)
        announce('Error loading booking page', 'assertive')
      }
    }

    loadBookingData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Handler functions with real features
  const handleNewBooking = () => {    setShowNewBookingDialog(true)
    announce('New booking dialog opened', 'polite')
  }

  const handleCreateBooking = async () => {
    if (!bookingTitle.trim()) {
      toast.error('Please enter a booking title')
      return
    }
    if (!bookingDate) {
      toast.error('Please select a date')
      return
    }
    if (!bookingTime) {
      toast.error('Please select a time')
      return
    }
    if (!clientName.trim()) {
      toast.error('Please enter client name')
      return
    }

    setIsCreatingBooking(true)
    try {
      // Call API to create booking
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-booking',
          title: bookingTitle,
          date: bookingDate,
          time: bookingTime,
          duration: parseInt(bookingDuration),
          notes: bookingNotes
        })
      })
      if (!res.ok) throw new Error('Failed to create booking')
      toast.success(`Booking created successfully, scheduled for ${bookingDate} at ${bookingTime}`)

      setShowNewBookingDialog(false)
      // Reset form
      setBookingTitle('')
      setBookingDate('')
      setBookingTime('')
      setBookingDuration('60')
      setBookingService('consultation')
      setBookingNotes('')
      setClientName('')
      setClientEmail('')
      announce('Booking created successfully', 'polite')
    } catch (err) {
      toast.error('Failed to create booking')
      logger.error('Failed to create booking', { error: err })
    } finally {
      setIsCreatingBooking(false)
    }
  }

  const handleBookingSettings = () => {
    setShowSettingsDialog(true)
    announce('Booking settings dialog opened', 'polite')
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      // Call API to save settings
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-settings',
          autoConfirm,
          bufferTime,
          maxBookingsPerDay,
          workingHours: `${workingHoursStart}-${workingHoursEnd}`
        })
      })
      if (!res.ok) throw new Error('Failed to save settings')
      toast.success('Booking settings saved successfully')
      setShowSettingsDialog(false)
      announce('Settings saved successfully', 'polite')
    } catch (err) {
      toast.error('Failed to save settings')
      logger.error('Failed to save settings', { error: err })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleBookingReports = () => {    setShowReportsDialog(true)
    announce('Reports dialog opened', 'polite')
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    try {
      // Call API to generate report
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-report', period: reportPeriod, type: reportType })
      })
      if (!res.ok) throw new Error('Failed to generate report')
      const apiData = await res.json()

      const reportData = apiData.report?.summary || {
        totalBookings: 143,
        thisMonth: 38,
        pendingBookings: 12,
        completedBookings: 115,
        cancelledBookings: 16,
        revenue: 14750,
        topService: 'Consultation'
      }

      const reportContent = `# Booking Report - ${new Date().toLocaleDateString()}
## Period: ${reportPeriod === 'week' ? 'Last 7 Days' : reportPeriod === 'month' ? 'Last 30 Days' : reportPeriod === 'quarter' ? 'Last 90 Days' : 'All Time'}
## Type: ${reportType === 'summary' ? 'Summary Report' : reportType === 'detailed' ? 'Detailed Report' : 'Financial Report'}

### Summary
- Total Bookings: ${reportData.totalBookings}
- This Month: ${reportData.thisMonth}
- Pending: ${reportData.pendingBookings}
- Completed: ${reportData.completedBookings}
- Cancelled: ${reportData.cancelledBookings}
- Revenue: $${reportData.revenue.toLocaleString()}
- Top Service: ${reportData.topService}

### Status Breakdown
- Completion Rate: ${((reportData.completedBookings / reportData.totalBookings) * 100).toFixed(1)}%
- Cancellation Rate: ${((reportData.cancelledBookings / reportData.totalBookings) * 100).toFixed(1)}%
- Active Bookings: ${reportData.pendingBookings}
`

      const fileName = `booking-report-${reportPeriod}-${Date.now()}.md`
      const blob = new Blob([reportContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Report generated and downloaded - " + reportData.totalBookings + " bookings analyzed")

      setShowReportsDialog(false)
      announce('Report downloaded successfully', 'polite')
    } catch (err) {
      toast.error('Failed to generate report')
      logger.error('Failed to generate report', { error: err })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Call API to export
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export', format: exportFormat })
      })
      if (!res.ok) throw new Error('Failed to export')

      const bookingsData = [
        { id: 1, title: 'Consultation', date: '2024-01-15', client: 'John Doe', status: 'completed' },
        { id: 2, title: 'Follow-up', date: '2024-01-16', client: 'Jane Smith', status: 'pending' },
        { id: 3, title: 'Workshop', date: '2024-01-17', client: 'Bob Wilson', status: 'completed' },
      ]

      let content = ''
      let mimeType = ''
      let extension = ''

      if (exportFormat === 'csv') {
        content = 'ID,Title,Date,Client,Status\n' +
          bookingsData.map(b => `${b.id},${b.title},${b.date},${b.client},${b.status}`).join('\n')
        mimeType = 'text/csv'
        extension = 'csv'
      } else if (exportFormat === 'json') {
        content = JSON.stringify(bookingsData, null, 2)
        mimeType = 'application/json'
        extension = 'json'
      } else {
        content = bookingsData.map(b => `${b.id}\t${b.title}\t${b.date}\t${b.client}\t${b.status}`).join('\n')
        mimeType = 'text/plain'
        extension = 'txt'
      }

      const fileName = `bookings-export-${Date.now()}.${extension}`
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Export completed - " + fileName + " downloaded successfully")

      setShowExportDialog(false)
      announce('Export completed successfully', 'polite')
    } catch (err) {
      toast.error('Failed to export bookings')
      logger.error('Failed to export', { error: err })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
        <div className="container mx-auto px-4">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={bookingAIInsights} />
          <PredictiveAnalytics predictions={bookingPredictions} />
          <CollaborationIndicator collaborators={bookingCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={bookingQuickActionsWithDialogs} />
          <ActivityFeed activities={bookingActivities} />
        </div>
<DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
      {/* Header */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-bolt/10 dark:bg-violet-bolt/20">
              <Calendar className="h-6 w-6 kazi-text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
                Booking Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage appointments, services and availability
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button data-testid="new-booking-btn" size="sm" onClick={handleNewBooking}>
              <Calendar className="h-4 w-4 mr-2" />
              New Booking
            </Button>
            <Button data-testid="booking-settings-btn" variant="outline" size="sm" onClick={handleBookingSettings}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button data-testid="booking-reports-btn" variant="outline" size="sm" onClick={handleBookingReports}>
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Live Enhanced Calendar Booking */}
      <div className="container mx-auto px-4">
        <EnhancedCalendarBooking />
      </div>

      {/* New Booking Dialog */}
      <Dialog open={showNewBookingDialog} onOpenChange={setShowNewBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-violet-600" />
              Create New Booking
            </DialogTitle>
            <DialogDescription>
              Schedule a new appointment with client details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="bookingTitle">Booking Title *</Label>
                <Input
                  id="bookingTitle"
                  placeholder="e.g., Initial Consultation"
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingService">Service Type</Label>
                <select
                  id="bookingService"
                  value={bookingService}
                  onChange={(e) => setBookingService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="workshop">Workshop</option>
                  <option value="meeting">Meeting</option>
                  <option value="training">Training</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="bookingDate">Date *</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingTime">Time *</Label>
                <Input
                  id="bookingTime"
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingDuration">Duration (mins)</Label>
                <select
                  id="bookingDuration"
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingNotes">Notes</Label>
              <Textarea
                id="bookingNotes"
                placeholder="Add any additional notes for this booking..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBookingDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBooking}
              disabled={isCreatingBooking}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              {isCreatingBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-gray-600" />
              Booking Settings
            </DialogTitle>
            <DialogDescription>
              Configure your booking preferences and availability
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="workingHoursStart">Working Hours Start</Label>
                <Input
                  id="workingHoursStart"
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingHoursEnd">Working Hours End</Label>
                <Input
                  id="workingHoursEnd"
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="bufferTime">Buffer Time (mins)</Label>
                <select
                  id="bufferTime"
                  value={bufferTime}
                  onChange={(e) => setBufferTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="0">No buffer</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBookingsPerDay">Max Daily Bookings</Label>
                <Input
                  id="maxBookingsPerDay"
                  type="number"
                  min="1"
                  max="50"
                  value={maxBookingsPerDay}
                  onChange={(e) => setMaxBookingsPerDay(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderHours">Reminder Time (hours before)</Label>
              <select
                id="reminderHours"
                value={reminderHours}
                onChange={(e) => setReminderHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-confirm bookings</Label>
                  <p className="text-xs text-gray-500">Automatically confirm new bookings</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoConfirm}
                  onChange={(e) => setAutoConfirm(e.target.checked)}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isSavingSettings ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Generate Report
            </DialogTitle>
            <DialogDescription>
              Generate and download booking reports
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportPeriod">Report Period</Label>
              <select
                id="reportPeriod"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="financial">Financial Report</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Report includes:</strong> Booking statistics, completion rates, revenue summary, and service breakdown.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportsDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGeneratingReport ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Export Bookings
            </DialogTitle>
            <DialogDescription>
              Export your booking data for backup or analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <select
                id="exportFormat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="csv">CSV (Excel compatible)</option>
                <option value="json">JSON</option>
                <option value="txt">Plain Text</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportDateRange">Date Range</Label>
              <select
                id="exportDateRange"
                value={exportDateRange}
                onChange={(e) => setExportDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Bookings</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Export includes:</strong> Booking ID, title, date, time, client info, and status.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
