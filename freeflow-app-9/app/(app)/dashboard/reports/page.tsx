'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  FileText, 
  PieChart, 
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Clock,
  DollarSign,
  Plus,
  Search,
  FileSpreadsheet,
  FilePdf,
  FileJson,
  Bell,
  Star,
  Lightbulb,
  Briefcase,
  Building,
  Repeat,
  CheckCircle,
  ChevronRight,
  Sparkles,
  HardDrive
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState('7d')

  // Handlers
  const handleGenerateReport = (type: string) => { console.log('📊 GEN:', type); alert(`📊 Generating ${type}...`) }
  const handleExportReport = (format: string) => { console.log('💾 EXP:', format); alert(`💾 Export ${format}`) }
  const handleScheduleReport = () => { console.log('📅 SCHED'); alert('📅 Schedule') }
  const handleShareReport = () => { console.log('🔗 SHARE'); alert('🔗 Share') }
  const handleSaveReport = () => { console.log('💾 SAVE'); alert('💾 Saved') }
  const handlePrintReport = () => { console.log('🖨️ PRINT'); window.print() }
  const handleFilterData = (filter: string) => { console.log('🔍 FILT:', filter); alert(`🔍 ${filter}`) }
  const handleDateRange = (range: string) => { console.log('📅 RANGE:', range); setTimeRange(range) }
  const handleCustomReport = () => { console.log('🎨 CUSTOM'); alert('🎨 Custom') }
  const handleCompareReports = () => { console.log('⚖️ CMP'); alert('⚖️ Compare') }
  const handleEmailReport = () => { console.log('📧 EMAIL'); alert('📧 Email') }
  const handleDashboardView = () => { console.log('📊 DASH'); alert('📊 Dashboard') }
  const handleDetailedView = () => { console.log('🔍 DETAIL'); alert('🔍 Detail') }
  const handleSummaryView = () => { console.log('📋 SUMM'); alert('📋 Summary') }
  const handleRefreshData = () => { console.log('🔄 REFRESH'); alert('🔄 Refresh') }
  const handleBenchmark = () => { console.log('📏 BENCH'); alert('📏 Benchmark') }
  const handleInsights = () => { console.log('💡 AI'); alert('💡 AI Insights') }
  const handleAnnotate = () => { console.log('✏️ NOTE'); alert('✏️ Annotate') }
  const handleArchiveReport = () => { console.log('📦 ARCH'); alert('📦 Archive') }
  const handleDeleteReport = () => { console.log('🗑️ DEL'); confirm('Delete?') && alert('✅ Deleted') }

  return (
    <div className="p-6 space-y-6 kazi-bg-light min-h-screen">
      <PageHeader
        title="Reports"
        description="Comprehensive analytics and reporting dashboard"
        icon={BarChart3}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports' }
        ]}
      />

      {/* Report Overview Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="kazi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">256</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+12% from last period</span>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="kazi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled Reports</p>
                <p className="text-2xl font-bold">28</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+8% from last period</span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="kazi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Report Exports</p>
                <p className="text-2xl font-bold">1,458</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+15% from last period</span>
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Download className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="kazi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Sources</p>
                <p className="text-2xl font-bold">12</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">No change from last period</span>
                </div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <HardDrive className="h-5 w-5 text-yellow-600" />
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
              <CardTitle>Reports</CardTitle>
              <CardDescription>Create and manage your analytical reports</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first analytical report
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card className="kazi-card">
        <CardHeader>
          <CardTitle>Advanced Features Coming Soon</CardTitle>
          <CardDescription>
            We're working on powerful reporting tools to enhance your analytics experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <div className="p-3 rounded-full bg-blue-100 mb-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent analysis and automated reporting
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <div className="p-3 rounded-full bg-purple-100 mb-4">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-1">Custom Templates</h3>
              <p className="text-sm text-muted-foreground">
                Build and save custom report templates
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <div className="p-3 rounded-full bg-green-100 mb-4">
                <ChevronRight className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-1">Advanced Exports</h3>
              <p className="text-sm text-muted-foreground">
                Export to multiple formats with scheduling
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
