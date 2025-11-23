'use client'

import { useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingUp,
  Clock,
  Award,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Download,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('ClientValueDashboard')

interface ValueMetrics {
  totalInvestment: number
  deliverableValue: number
  timeSaved: number
  qualityScore: number
  projectsCompleted: number
  onTimeDelivery: number
  firstTimeApproval: number
  revisionCount: number
  avgResponseTime: number
  customerSatisfaction: number
}

interface ROICalculation {
  roi: number
  roiPercentage: number
  netValue: number
  hourlyRate: number
  totalHours: number
  costSavings: number
}

interface StatCardProps {
  title: string
  value: string | number
  trend: string
  trendUp: boolean
  icon: React.ElementType
  prefix?: string
  suffix?: string
  description?: string
}

function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  prefix = '',
  suffix = '',
  description
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            {description && (
              <TooltipContent>
                <p className="max-w-xs">{description}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {trendUp ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <p className={`text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ClientValueDashboard() {
  const [dateRange, setDateRange] = useState('all-time')
  const [calculatorOpen, setCalculatorOpen] = useState(false)

  // Calculator state
  const [projectBudget, setProjectBudget] = useState(10000)
  const [projectDuration, setProjectDuration] = useState(30)
  const [inHouseHourlyRate, setInHouseHourlyRate] = useState(50)
  const [estimatedInHouseHours, setEstimatedInHouseHours] = useState(200)

  // Mock data - would come from API
  const metrics: ValueMetrics = {
    totalInvestment: 45000,
    deliverableValue: 78000,
    timeSaved: 340,
    qualityScore: 94,
    projectsCompleted: 12,
    onTimeDelivery: 92,
    firstTimeApproval: 85,
    revisionCount: 18,
    avgResponseTime: 2.5,
    customerSatisfaction: 4.7
  }

  // Calculate ROI
  const roi = useMemo((): ROICalculation => {
    const netValue = metrics.deliverableValue - metrics.totalInvestment
    const roiPercentage = (netValue / metrics.totalInvestment) * 100
    const hourlyRate = inHouseHourlyRate
    const totalHours = metrics.timeSaved
    const costSavings = totalHours * hourlyRate

    return {
      roi: netValue,
      roiPercentage,
      netValue,
      hourlyRate,
      totalHours,
      costSavings
    }
  }, [metrics, inHouseHourlyRate])

  // Calculate custom ROI
  const customROI = useMemo(() => {
    const inHouseCost = estimatedInHouseHours * inHouseHourlyRate
    const savings = inHouseCost - projectBudget
    const roiPercentage = (savings / projectBudget) * 100

    return {
      inHouseCost,
      projectCost: projectBudget,
      savings,
      roiPercentage
    }
  }, [projectBudget, inHouseHourlyRate, estimatedInHouseHours])

  const exportReport = async () => {
    logger.info('Exporting value report', {
      dateRange,
      metrics,
      roi
    })

    // Generate CSV data
    const csvData = `
KAZI Client Value Report
Generated: ${new Date().toLocaleDateString()}
Date Range: ${dateRange}

INVESTMENT SUMMARY
Total Investment,$${metrics.totalInvestment.toLocaleString()}
Deliverable Value,$${metrics.deliverableValue.toLocaleString()}
Net ROI,$${roi.netValue.toLocaleString()}
ROI Percentage,${roi.roiPercentage.toFixed(1)}%

TIME SAVINGS
Total Hours Saved,${metrics.timeSaved}
Equivalent Cost Savings,$${roi.costSavings.toLocaleString()}

QUALITY METRICS
Quality Score,${metrics.qualityScore}%
First-time Approval Rate,${metrics.firstTimeApproval}%
On-time Delivery,${metrics.onTimeDelivery}%
Average Revisions per Project,${(metrics.revisionCount / metrics.projectsCompleted).toFixed(1)}

PROJECT PERFORMANCE
Projects Completed,${metrics.projectsCompleted}
Customer Satisfaction,${metrics.customerSatisfaction}/5.0
Avg Response Time,${metrics.avgResponseTime} hours
    `.trim()

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kazi-value-report-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Value report exported', {
      description: 'Your comprehensive value report has been downloaded as CSV'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Value Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Track your investment, ROI, and the real value you're getting from KAZI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>

          <Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calculator className="mr-2 h-4 w-4" />
                ROI Calculator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>ROI Calculator</DialogTitle>
                <DialogDescription>
                  Calculate potential ROI for your next project
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Project Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={projectBudget}
                      onChange={e => setProjectBudget(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={projectDuration}
                      onChange={e => setProjectDuration(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">In-house Hourly Rate ($)</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      value={inHouseHourlyRate}
                      onChange={e => setInHouseHourlyRate(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours">Estimated In-house Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={estimatedInHouseHours}
                      onChange={e => setEstimatedInHouseHours(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="border rounded-lg p-6 bg-accent/50">
                  <h4 className="font-semibold text-lg mb-4">Projected ROI</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">In-house Cost</p>
                      <p className="text-2xl font-bold">
                        ${customROI.inHouseCost.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">KAZI Project Cost</p>
                      <p className="text-2xl font-bold">
                        ${customROI.projectCost.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Savings</p>
                      <p className="text-2xl font-bold text-green-500">
                        ${customROI.savings.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-2xl font-bold text-green-500">
                        {customROI.roiPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Investment"
          value={metrics.totalInvestment}
          prefix="$"
          trend="+12% vs last quarter"
          trendUp={true}
          icon={DollarSign}
          description="Total amount invested in projects on KAZI"
        />
        <StatCard
          title="Deliverable Value"
          value={metrics.deliverableValue}
          prefix="$"
          trend={`${roi.roiPercentage.toFixed(0)}% ROI`}
          trendUp={true}
          icon={TrendingUp}
          description="Estimated market value of all deliverables received"
        />
        <StatCard
          title="Time Saved"
          value={metrics.timeSaved}
          suffix=" hrs"
          trend={`Equivalent to $${roi.costSavings.toLocaleString()}`}
          trendUp={true}
          icon={Clock}
          description="Time saved vs. in-house production"
        />
        <StatCard
          title="Quality Score"
          value={metrics.qualityScore}
          suffix="%"
          trend="+8% improvement"
          trendUp={true}
          icon={Award}
          description="Composite quality score based on approvals and satisfaction"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* ROI Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ROI Summary</CardTitle>
                <CardDescription>Your return on investment breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Investment</span>
                    <span className="font-semibold">
                      ${metrics.totalInvestment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Value Received</span>
                    <span className="font-semibold">
                      ${metrics.deliverableValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-semibold">Net ROI</span>
                    <span className="text-2xl font-bold text-green-500">
                      +${roi.netValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">ROI Percentage</span>
                    <span className="text-2xl font-bold text-green-500">
                      {roi.roiPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Value Multiplier</span>
                    <span className="text-sm font-semibold">
                      {(metrics.deliverableValue / metrics.totalInvestment).toFixed(2)}x
                    </span>
                  </div>
                  <Progress
                    value={(metrics.deliverableValue / metrics.totalInvestment) * 50}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Every $1 invested returns ${(metrics.deliverableValue / metrics.totalInvestment).toFixed(2)} in value
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Success Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Success Milestones</CardTitle>
                <CardDescription>Your achievements on KAZI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Projects Completed</span>
                    </div>
                    <span className="font-semibold">{metrics.projectsCompleted}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm">On-time Delivery</span>
                    </div>
                    <span className="font-semibold">{metrics.onTimeDelivery}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">First-time Approval</span>
                    </div>
                    <span className="font-semibold">{metrics.firstTimeApproval}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Customer Satisfaction</span>
                    </div>
                    <span className="font-semibold">
                      {metrics.customerSatisfaction}/5.0
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Overall Performance</p>
                  <Progress value={metrics.qualityScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    You're in the top 15% of KAZI clients based on project success metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time & Cost Savings */}
          <Card>
            <CardHeader>
              <CardTitle>Time & Cost Savings Analysis</CardTitle>
              <CardDescription>
                Comparison of KAZI vs. in-house production costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Time Saved</p>
                  <p className="text-3xl font-bold">{metrics.timeSaved} hrs</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Equivalent to {Math.round(metrics.timeSaved / 8)} work days
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cost Savings</p>
                  <p className="text-3xl font-bold text-green-500">
                    ${roi.costSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on ${inHouseHourlyRate}/hr in-house rate
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Value</p>
                  <p className="text-3xl font-bold text-blue-500">
                    ${(roi.costSavings + roi.netValue).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cost savings + deliverable value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI Analysis Tab */}
        <TabsContent value="roi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed ROI Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of your return on investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* ROI by Project Type */}
                <div>
                  <h4 className="font-semibold mb-4">ROI by Project Type</h4>
                  <div className="space-y-3">
                    {[
                      { type: 'Design Projects', roi: 185, projects: 5, value: 32000 },
                      { type: 'Video Production', roi: 165, projects: 4, value: 28000 },
                      { type: 'Marketing Content', roi: 195, projects: 3, value: 18000 }
                    ].map(item => (
                      <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.projects} projects • ${item.value.toLocaleString()} value
                          </p>
                        </div>
                        <Badge variant={item.roi > 180 ? 'default' : 'secondary'}>
                          {item.roi}% ROI
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Value Over Time */}
                <div>
                  <h4 className="font-semibold mb-4">Value Creation Timeline</h4>
                  <p className="text-sm text-muted-foreground">
                    Tracking how your investment value has grown over time
                  </p>
                  {/* Placeholder for chart */}
                  <div className="h-64 flex items-center justify-center border rounded-lg mt-4 bg-accent/20">
                    <BarChart3 className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Performance</CardTitle>
                <CardDescription>Delivery quality and approval metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">First-time Approval Rate</span>
                      <span className="font-semibold">{metrics.firstTimeApproval}%</span>
                    </div>
                    <Progress value={metrics.firstTimeApproval} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">On-time Delivery</span>
                      <span className="font-semibold">{metrics.onTimeDelivery}%</span>
                    </div>
                    <Progress value={metrics.onTimeDelivery} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="font-semibold">
                        {metrics.customerSatisfaction}/5.0
                      </span>
                    </div>
                    <Progress value={(metrics.customerSatisfaction / 5) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
                <CardDescription>Response times and revision tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-semibold">{metrics.avgResponseTime} hrs</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Revisions per Project</span>
                    <span className="font-semibold">
                      {(metrics.revisionCount / metrics.projectsCompleted).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Projects</span>
                    <span className="font-semibold">{metrics.projectsCompleted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarking</CardTitle>
              <CardDescription>
                Compare your performance against industry averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { metric: 'ROI Percentage', your: roi.roiPercentage, avg: 120, industry: 'Creative Services' },
                  { metric: 'Project Completion Rate', your: 100, avg: 85, industry: 'Creative Services' },
                  { metric: 'Time to Delivery', your: metrics.onTimeDelivery, avg: 78, industry: 'Creative Services' },
                  { metric: 'Client Satisfaction', your: (metrics.customerSatisfaction / 5) * 100, avg: 82, industry: 'Creative Services' }
                ].map(item => (
                  <div key={item.metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.metric}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Industry Avg: {item.avg}%
                        </span>
                        <span className="text-sm font-semibold">
                          You: {item.your.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-accent rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.your > 100 ? 100 : item.your}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="absolute h-2 bg-primary rounded-full"
                      />
                      <div
                        className="absolute h-4 w-0.5 bg-muted-foreground -top-1"
                        style={{ left: `${item.avg}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.your > item.avg
                        ? `You're ${(item.your - item.avg).toFixed(0)}% above industry average`
                        : `${(item.avg - item.your).toFixed(0)}% below industry average`}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
