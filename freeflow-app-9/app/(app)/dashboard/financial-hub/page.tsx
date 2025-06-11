'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  Shield, 
  Receipt, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Send,
  Calendar,
  Target,
  ExternalLink,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

// Mock financial data
const mockEscrowFunds = [
  {
    id: 1,
    projectName: 'Brand Identity Design',
    client: 'TechCorp Inc.',
    totalAmount: 2500,
    secured: 2500,
    released: 1875,
    pending: 625,
    status: 'active',
    milestones: [
      { name: 'Initial Concepts', amount: 625, status: 'released', date: '2024-01-05' },
      { name: 'Revisions', amount: 625, status: 'released', date: '2024-01-10' },
      { name: 'Final Designs', amount: 625, status: 'released', date: '2024-01-12' },
      { name: 'Brand Guidelines', amount: 625, status: 'pending', date: '2024-01-15' }
    ]
  },
  {
    id: 2,
    projectName: 'E-commerce Website',
    client: 'Fashion Forward',
    totalAmount: 5000,
    secured: 5000,
    released: 3000,
    pending: 2000,
    status: 'active',
    milestones: [
      { name: 'Design Phase', amount: 1500, status: 'released', date: '2024-01-08' },
      { name: 'Development Setup', amount: 1500, status: 'released', date: '2024-01-11' },
      { name: 'Frontend Development', amount: 2000, status: 'pending', date: '2024-01-18' }
    ]
  }
]

const mockInvoices = [
  {
    id: 'INV-2024-001',
    client: 'TechCorp Inc.',
    amount: 1200,
    status: 'paid',
    dueDate: '2024-01-15',
    paidDate: '2024-01-10',
    items: [
      { description: 'UI/UX Design Services', amount: 800 },
      { description: 'Brand Consultation', amount: 400 }
    ]
  },
  {
    id: 'INV-2024-002',
    client: 'StartupXYZ',
    amount: 800,
    status: 'pending',
    dueDate: '2024-01-20',
    items: [
      { description: 'Mobile App Design', amount: 800 }
    ]
  },
  {
    id: 'INV-2024-003',
    client: 'Fashion Forward',
    amount: 1500,
    status: 'overdue',
    dueDate: '2024-01-12',
    items: [
      { description: 'Website Development', amount: 1500 }
    ]
  }
]

const escrowStatusConfig = {
  active: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Active' },
  completed: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Completed' },
  disputed: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Disputed' }
}

const invoiceStatusConfig = {
  paid: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Paid', icon: CheckCircle },
  pending: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Pending', icon: Clock },
  overdue: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Overdue', icon: AlertCircle }
}

const milestoneStatusConfig = {
  released: { color: 'text-green-600', icon: CheckCircle },
  pending: { color: 'text-yellow-600', icon: Clock },
  disputed: { color: 'text-red-600', icon: AlertCircle }
}

export default function FinancialHubPage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  // Calculate totals
  const totalEscrowSecured = mockEscrowFunds.reduce((sum, fund) => sum + fund.secured, 0)
  const totalEscrowReleased = mockEscrowFunds.reduce((sum, fund) => sum + fund.released, 0)
  const totalEscrowPending = mockEscrowFunds.reduce((sum, fund) => sum + fund.pending, 0)
  
  const totalInvoiceAmount = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidInvoiceAmount = mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingInvoiceAmount = mockInvoices.filter(inv => inv.status === 'pending').reduce((sum, invoice) => sum + invoice.amount, 0)

  const EscrowCard = ({ fund }: { fund: any }) => {
    const statusInfo = escrowStatusConfig[fund.status as keyof typeof escrowStatusConfig]
    const releasePercentage = (fund.released / fund.totalAmount) * 100

    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{fund.projectName}</CardTitle>
              <CardDescription>{fund.client}</CardDescription>
            </div>
            <Badge variant="outline" className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Amount Overview */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">${fund.secured.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Secured</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">${fund.released.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Released</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">${fund.pending.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Release Progress</span>
              <span className="font-medium">{releasePercentage.toFixed(0)}%</span>
            </div>
            <Progress value={releasePercentage} className="h-2" />
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Milestones</p>
            {fund.milestones.slice(-2).map((milestone: any, index: number) => {
              const milestoneInfo = milestoneStatusConfig[milestone.status as keyof typeof milestoneStatusConfig]
              const MilestoneIcon = milestoneInfo.icon
              
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <MilestoneIcon className={`h-3 w-3 ${milestoneInfo.color}`} />
                  <span className="flex-1">{milestone.name}</span>
                  <span className="font-medium">${milestone.amount}</span>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Target className="h-3 w-3 mr-1" />
              Milestones
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const InvoiceCard = ({ invoice }: { invoice: any }) => {
    const statusInfo = invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig]
    const StatusIcon = statusInfo.icon

    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{invoice.id}</CardTitle>
              <CardDescription>{invoice.client}</CardDescription>
            </div>
            <Badge variant="outline" className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="text-center">
            <div className="text-2xl font-bold">${invoice.amount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Amount</div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Due Date</div>
              <div className="font-medium">{invoice.dueDate}</div>
            </div>
            {invoice.paidDate && (
              <div>
                <div className="text-gray-500">Paid Date</div>
                <div className="font-medium">{invoice.paidDate}</div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Items</p>
            {invoice.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.description}</span>
                <span className="font-medium">${item.amount}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            {invoice.status === 'pending' && (
              <Button size="sm" variant="outline">
                <Send className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Financial Hub
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage escrow funds and track invoices
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </Button>
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Escrow Secured
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900">${totalEscrowSecured.toLocaleString()}</div>
              <p className="text-xs text-emerald-600 mt-1">Across {mockEscrowFunds.length} projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Released Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">${totalEscrowReleased.toLocaleString()}</div>
              <p className="text-xs text-blue-600 mt-1">{((totalEscrowReleased / totalEscrowSecured) * 100).toFixed(0)}% of total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Paid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">${paidInvoiceAmount.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">{mockInvoices.filter(i => i.status === 'paid').length} invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">${(totalEscrowPending + pendingInvoiceAmount).toLocaleString()}</div>
              <p className="text-xs text-yellow-600 mt-1">Escrow + Invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="overview" className="gap-2" data-testid="overview-tab">
              <DollarSign className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="escrow" className="gap-2" data-testid="escrow-tab">
              <Shield className="h-4 w-4" />
              Escrow System
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2" data-testid="invoices-tab">
              <Receipt className="h-4 w-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Summary */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-emerald-600" />
                  Financial Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="font-medium">Total Revenue</span>
                    </div>
                    <span className="font-bold text-emerald-600">
                      ${(totalEscrowReleased + paidInvoiceAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="font-medium">Secured in Escrow</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      ${totalEscrowSecured.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="font-medium">Pending Payments</span>
                    </div>
                    <span className="font-bold text-yellow-600">
                      ${(totalEscrowPending + pendingInvoiceAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Payment Released</div>
                      <div className="text-xs text-gray-500">Brand Identity - Final Designs milestone</div>
                    </div>
                    <span className="font-medium text-green-600">+$625</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Receipt className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Invoice Paid</div>
                      <div className="text-xs text-gray-500">INV-2024-001 - TechCorp Inc.</div>
                    </div>
                    <span className="font-medium text-blue-600">+$1,200</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Escrow Secured</div>
                      <div className="text-xs text-gray-500">E-commerce Website project</div>
                    </div>
                    <span className="font-medium text-emerald-600">+$5,000</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Escrow System Tab */}
          <TabsContent value="escrow" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-600" />
                  Escrow System
                </h2>
                <Link href="/dashboard/escrow">
                  <Button variant="outline" className="gap-2">
                    Full Escrow Management
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockEscrowFunds.map((fund) => (
                  <EscrowCard key={fund.id} fund={fund} />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Receipt className="h-6 w-6 text-blue-600" />
                  Invoice Management
                </h2>
                <Link href="/dashboard/invoices">
                  <Button variant="outline" className="gap-2">
                    Full Invoice System
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockInvoices.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 