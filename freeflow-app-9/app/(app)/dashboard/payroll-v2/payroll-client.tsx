'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { DollarSign, Calendar, Users, TrendingUp, Download, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const payrollRuns = [
  { id: 1, period: 'January 2024', status: 'processed', employees: 145, grossPay: 875000, netPay: 682500, taxes: 192500, date: '2024-01-31' },
  { id: 2, period: 'February 2024', status: 'processing', employees: 148, grossPay: 895000, netPay: 698250, taxes: 196750, date: '2024-02-29' },
  { id: 3, period: 'March 2024', status: 'scheduled', employees: 150, grossPay: 910000, netPay: 710500, taxes: 199500, date: '2024-03-31' },
]

const employeePayroll = [
  { name: 'John Smith', department: 'Engineering', salary: 95000, bonus: 5000, deductions: 15000, netPay: 85000, status: 'approved' },
  { name: 'Emma Wilson', department: 'Product', salary: 85000, bonus: 3000, deductions: 13200, netPay: 74800, status: 'approved' },
  { name: 'Michael Brown', department: 'Sales', salary: 75000, bonus: 8000, deductions: 12450, netPay: 70550, status: 'pending' },
  { name: 'Sarah Davis', department: 'Marketing', salary: 70000, bonus: 2000, deductions: 10800, netPay: 61200, status: 'approved' },
  { name: 'Alex Johnson', department: 'Design', salary: 80000, bonus: 4000, deductions: 12600, netPay: 71400, status: 'approved' },
]

const payrollSummary = [
  { category: 'Gross Salaries', amount: 756000, percentage: 84.3 },
  { category: 'Bonuses & Commissions', amount: 65000, percentage: 7.2 },
  { category: 'Benefits', amount: 45000, percentage: 5.0 },
  { category: 'Tax Withholdings', amount: 125000, percentage: 13.9 },
  { category: 'Other Deductions', amount: 32000, percentage: 3.6 },
]

const upcomingPayments = [
  { name: 'Quarterly Bonuses', amount: 125000, date: '2024-03-15', type: 'bonus' },
  { name: 'Health Insurance', amount: 28000, date: '2024-03-01', type: 'benefits' },
  { name: 'Retirement Contributions', amount: 45000, date: '2024-03-05', type: 'benefits' },
]

export default function PayrollClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalEmployees: employeePayroll.length,
    totalGrossPay: employeePayroll.reduce((sum, e) => sum + e.salary + e.bonus, 0),
    totalNetPay: employeePayroll.reduce((sum, e) => sum + e.netPay, 0),
    totalDeductions: employeePayroll.reduce((sum, e) => sum + e.deductions, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      processed: 'bg-green-100 text-green-700',
      processing: 'bg-blue-100 text-blue-700',
      scheduled: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredEmployees = useMemo(() =>
    employeePayroll.filter(e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery])

  const insights = [
    { icon: Users, title: `${stats.totalEmployees}`, description: 'Employees' },
    { icon: DollarSign, title: `$${(stats.totalGrossPay / 1000).toFixed(0)}k`, description: 'Gross pay' },
    { icon: TrendingUp, title: `$${(stats.totalNetPay / 1000).toFixed(0)}k`, description: 'Net pay' },
    { icon: AlertTriangle, title: `$${(stats.totalDeductions / 1000).toFixed(0)}k`, description: 'Deductions' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><DollarSign className="h-8 w-8 text-primary" />Payroll Management</h1>
          <p className="text-muted-foreground mt-1">Process and manage employee payroll</p>
        </div>
        <Button><Calendar className="h-4 w-4 mr-2" />Run Payroll</Button>
      </div>

      <CollapsibleInsightsPanel title="Payroll Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Period</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Input placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Payroll</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredEmployees.map((employee, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{employee.name}</h4>
                            <p className="text-sm text-muted-foreground">{employee.department}</p>
                          </div>
                          {getStatusBadge(employee.status)}
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Salary</p>
                            <p className="font-medium">${employee.salary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bonus</p>
                            <p className="font-medium">${employee.bonus.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deductions</p>
                            <p className="font-medium text-red-600">-${employee.deductions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Net Pay</p>
                            <p className="font-medium text-green-600">${employee.netPay.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payroll Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payrollSummary.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{item.category}</span>
                          <span className="font-medium">${item.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline"><Download className="h-4 w-4 mr-2" />Export Reports</Button>
                  <Button className="w-full" variant="outline"><Send className="h-4 w-4 mr-2" />Send Payslips</Button>
                  <Button className="w-full" variant="outline"><CheckCircle className="h-4 w-4 mr-2" />Approve All</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payrollRuns.map((run) => (
                  <div key={run.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{run.period}</h4>
                        <p className="text-sm text-muted-foreground">{run.date}</p>
                      </div>
                      {getStatusBadge(run.status)}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Employees</p>
                        <p className="font-medium">{run.employees}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gross Pay</p>
                        <p className="font-medium">${run.grossPay.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Taxes</p>
                        <p className="font-medium">${run.taxes.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Pay</p>
                        <p className="font-medium text-green-600">${run.netPay.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments.map((payment, index) => (
                  <div key={index} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{payment.name}</h4>
                      <p className="text-sm text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">${payment.amount.toLocaleString()}</p>
                      <Badge variant="outline">{payment.type}</Badge>
                    </div>
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
