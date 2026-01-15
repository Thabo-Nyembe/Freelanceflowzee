'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useTaxSummary,
  useTaxInsights,
  useTaxDeductions,
  useDeductionBreakdown,
  useTaxProfile
} from '@/lib/hooks/use-tax-intelligence'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Lightbulb,
  Settings,
  PieChart,
  Receipt,
  BookOpen,
  Shield,
  X,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function TaxIntelligenceClient() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [taxProfileForm, setTaxProfileForm] = useState({
    primaryCountry: '',
    primaryState: '',
    businessStructure: '',
    taxIdNumber: '',
    fiscalYearEnd: '',
    taxFilingFrequency: 'quarterly'
  })
  const router = useRouter()

  const { summary, isLoading: summaryLoading } = useTaxSummary(selectedYear)
  const { insights, isLoading: insightsLoading, dismissInsight, markAsRead } = useTaxInsights()
  const { deductions, totalDeductions, approveDeduction, rejectDeduction } = useTaxDeductions(selectedYear)
  const { categories: deductionCategories } = useDeductionBreakdown(selectedYear)
  const { profile, updateProfile } = useTaxProfile()

  const handleDismissInsight = async (insightId: string) => {
    await dismissInsight(insightId)
    toast.success('Insight dismissed')
  }

  const handleApproveDeduction = async (deductionId: string) => {
    await approveDeduction(deductionId)
    toast.success('Deduction approved')
  }

  const handleDownloadReport = async () => {
    const toastId = toast.loading('Generating tax report...')
    try {
      const response = await fetch(`/api/tax/reports?year=${selectedYear}`)
      if (!response.ok) throw new Error('Failed to generate report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tax-report-${selectedYear}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Tax report downloaded', { id: toastId })
    } catch (error) {
      toast.error('Failed to download report', { id: toastId })
    }
  }

  const handleSaveTaxSettings = async () => {
    const toastId = toast.loading('Saving tax settings...')
    try {
      const { error } = await updateProfile(taxProfileForm)
      if (error) throw error

      toast.success('Tax settings saved successfully', { id: toastId })
      setSettingsOpen(false)
    } catch (error) {
      toast.error('Failed to save tax settings', { id: toastId })
    }
  }

  const handleInsightAction = (insight: any) => {
    if (insight.actionUrl) {
      router.push(insight.actionUrl)
    } else {
      toast.info('Action handler for this insight type coming soon')
    }
  }

  const handleViewFilingCalendar = () => {
    // Navigate to filings tab
    const filingsTab = document.querySelector('[value="filings"]') as HTMLElement
    if (filingsTab) {
      filingsTab.click()
      toast.success('Viewing filing calendar')
    }
  }

  const handleLessonClick = (lessonTitle: string) => {
    toast.info(`Opening lesson: ${lessonTitle}`, {
      description: 'Lesson content coming soon'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tax Intelligence
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Smart tax management, deduction tracking, and compliance automation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear - 1}>{currentYear - 1}</option>
              <option value={currentYear - 2}>{currentYear - 2}</option>
            </select>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Tax Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tax Settings</DialogTitle>
                  <DialogDescription>
                    Configure your tax profile and preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryCountry">Primary Country</Label>
                      <Select
                        value={taxProfileForm.primaryCountry || profile?.primaryCountry || ''}
                        onValueChange={(value) => setTaxProfileForm({ ...taxProfileForm, primaryCountry: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryState">State/Province</Label>
                      <Input
                        id="primaryState"
                        placeholder="e.g., California, Ontario"
                        value={taxProfileForm.primaryState || profile?.primaryState || ''}
                        onChange={(e) => setTaxProfileForm({ ...taxProfileForm, primaryState: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessStructure">Business Structure</Label>
                    <Select
                      value={taxProfileForm.businessStructure || profile?.businessStructure || ''}
                      onValueChange={(value) => setTaxProfileForm({ ...taxProfileForm, businessStructure: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select structure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="s_corp">S Corporation</SelectItem>
                        <SelectItem value="c_corp">C Corporation</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxIdNumber">Tax ID Number (EIN/SSN)</Label>
                    <Input
                      id="taxIdNumber"
                      placeholder="XX-XXXXXXX"
                      value={taxProfileForm.taxIdNumber || profile?.taxIdNumber || ''}
                      onChange={(e) => setTaxProfileForm({ ...taxProfileForm, taxIdNumber: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                      <Input
                        id="fiscalYearEnd"
                        type="date"
                        value={taxProfileForm.fiscalYearEnd || profile?.fiscalYearEnd || ''}
                        onChange={(e) => setTaxProfileForm({ ...taxProfileForm, fiscalYearEnd: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxFilingFrequency">Filing Frequency</Label>
                      <Select
                        value={taxProfileForm.taxFilingFrequency || profile?.taxFilingFrequency || 'quarterly'}
                        onValueChange={(value) => setTaxProfileForm({ ...taxProfileForm, taxFilingFrequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTaxSettings}>
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tax Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription>Year-to-Date Tax</CardDescription>
              <CardTitle className="text-3xl">
                ${summaryLoading ? '...' : summary?.totalTaxPaid.toLocaleString() || '0'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                Track every transaction
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardDescription>Total Deductions</CardDescription>
              <CardTitle className="text-3xl">
                ${totalDeductions.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <Receipt className="h-4 w-4 mr-1" />
                {deductions.length} deductions claimed
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardDescription>Estimated Tax Owed</CardDescription>
              <CardTitle className="text-3xl">
                ${summaryLoading ? '...' : summary?.estimatedTaxOwed.toLocaleString() || '0'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
                <Calendar className="h-4 w-4 mr-1" />
                Q1 due in 90 days
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardDescription>Tax Savings</CardDescription>
              <CardTitle className="text-3xl">
                ${(totalDeductions * 0.25).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                <TrendingDown className="h-4 w-4 mr-1" />
                Estimated at 25% rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <PieChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="deductions">
              <Receipt className="h-4 w-4 mr-2" />
              Deductions
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Lightbulb className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="filings">
              <FileText className="h-4 w-4 mr-2" />
              Filings
            </TabsTrigger>
            <TabsTrigger value="education">
              <BookOpen className="h-4 w-4 mr-2" />
              Learn
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Deduction Breakdown */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Deduction Breakdown</CardTitle>
                  <CardDescription>
                    Your deductions by category for {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deductionCategories.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-gray-500" />
                            <span className="font-medium capitalize">
                              {category.category.replace(/_/g, ' ')}
                            </span>
                            <Badge variant="secondary">{category.count}</Badge>
                          </div>
                          <span className="font-semibold">
                            ${category.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                            style={{
                              width: `${(category.total / totalDeductions) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tax tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Tax Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleViewFilingCalendar}>
                    <Calendar className="h-4 w-4 mr-2" />
                    View Filing Calendar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.info('Tax exemption certificates feature coming soon')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Tax Exemption Certificates
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setSettingsOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Tax Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deductions Tab */}
          <TabsContent value="deductions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Deductions</CardTitle>
                <CardDescription>
                  Track and manage your tax-deductible expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deductions.slice(0, 10).map((deduction) => (
                    <div
                      key={deduction.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{deduction.description}</span>
                          {deduction.aiSuggested && (
                            <Badge variant="secondary" className="text-xs">
                              AI Suggested
                            </Badge>
                          )}
                          <Badge
                            variant={
                              deduction.status === 'approved'
                                ? 'default'
                                : deduction.status === 'rejected'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {deduction.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{deduction.category.replace(/_/g, ' ')}</span>
                          <span>•</span>
                          <span>{new Date(deduction.expenseDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{deduction.deductionPercentage}% deductible</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            ${deduction.deductibleAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${deduction.expenseAmount.toLocaleString()} expense
                          </div>
                        </div>
                        {deduction.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveDeduction(deduction.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectDeduction(deduction.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Insights & Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions to optimize your taxes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 border rounded-lg ${
                        insight.priority === 'urgent'
                          ? 'border-red-500 bg-red-50 dark:bg-red-950'
                          : insight.priority === 'high'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {insight.priority === 'urgent' ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Lightbulb className="h-5 w-5 text-blue-500" />
                            )}
                            <h3 className="font-semibold">{insight.title}</h3>
                            <Badge variant={
                              insight.priority === 'urgent' ? 'destructive' :
                              insight.priority === 'high' ? 'default' : 'secondary'
                            }>
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {insight.description}
                          </p>
                          {insight.estimatedSavings && (
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              Potential savings: ${insight.estimatedSavings.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismissInsight(insight.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {insight.actionRequired && (
                        <Button size="sm" className="mt-3" onClick={() => handleInsightAction(insight)}>
                          {insight.actionLabel || 'Take Action'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filings Tab */}
          <TabsContent value="filings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Filings & Deadlines</CardTitle>
                <CardDescription>
                  Track your filing obligations and deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No filings yet. They will appear here when available.</p>
                  <Button className="mt-4" onClick={() => toast.info('Filing calendar and management features coming soon', {
                    description: 'Create filings, track deadlines, and upload documents'
                  })}>
                    <Calendar className="h-4 w-4 mr-2" />
                    View Filing Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Education Center</CardTitle>
                <CardDescription>
                  Learn how to maximize deductions and minimize taxes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Tax Basics for Freelancers', duration: '15 min', progress: 0 },
                    { title: 'Maximizing Deductions', duration: '20 min', progress: 0 },
                    { title: 'Quarterly Tax Planning', duration: '10 min', progress: 0 },
                    { title: 'International Tax Basics', duration: '25 min', progress: 0 },
                  ].map((lesson, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                      onClick={() => handleLessonClick(lesson.title)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">{lesson.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {lesson.duration}
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${lesson.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
