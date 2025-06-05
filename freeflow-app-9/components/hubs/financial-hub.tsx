"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Banknote,
  Wallet,
  PiggyBank,
  Receipt,
  Send,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface FinancialHubProps {
  earnings: number
  projects: any[]
  userId: string
}

interface Invoice {
  id: string
  project_id: string
  client_name: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  created_at: string
  invoice_number: string
  project_title: string
  paid_date?: string
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
}

interface EscrowTransaction {
  id: string
  project_id: string
  project_title: string
  client_name: string
  amount: number
  status: 'pending' | 'held' | 'released' | 'disputed' | 'refunded'
  created_at: string
  released_at?: string
  milestone: string
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  receipt_url?: string
}

export function FinancialHub({ earnings, projects, userId }: FinancialHubProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [isEscrowDialogOpen, setIsEscrowDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Mock data for demo
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: 'inv-1',
        project_id: 'proj-1',
        client_name: 'TechCorp Inc.',
        amount: 7500,
        status: 'paid',
        due_date: '2024-02-15',
        created_at: '2024-01-15',
        paid_date: '2024-02-10',
        project_title: 'E-commerce Website Redesign',
        invoice_number: 'INV-001',
        items: [
          { description: 'UI/UX Design', quantity: 1, rate: 3000, amount: 3000 },
          { description: 'Frontend Development', quantity: 1, rate: 4500, amount: 4500 }
        ]
      },
      {
        id: 'inv-2',
        project_id: 'proj-2',
        client_name: 'StartupXYZ',
        amount: 5000,
        status: 'sent',
        due_date: '2024-03-01',
        created_at: '2024-02-01',
        project_title: 'Mobile App Development',
        invoice_number: 'INV-002',
        items: [
          { description: 'App Development - Phase 1', quantity: 1, rate: 5000, amount: 5000 }
        ]
      },
      {
        id: 'inv-3',
        project_id: 'proj-3',
        client_name: 'Design Agency Co.',
        amount: 3200,
        status: 'overdue',
        due_date: '2024-01-30',
        created_at: '2024-01-10',
        project_title: 'Brand Identity Package',
        invoice_number: 'INV-003',
        items: [
          { description: 'Logo Design', quantity: 1, rate: 1500, amount: 1500 },
          { description: 'Brand Guidelines', quantity: 1, rate: 1700, amount: 1700 }
        ]
      }
    ]

    const mockExpenses: Expense[] = [
      {
        id: '1',
        description: 'Software subscriptions',
        amount: 299,
        category: 'software',
        date: '2024-01-15'
      },
      {
        id: '2',
        description: 'Office supplies',
        amount: 145,
        category: 'office',
        date: '2024-01-10'
      }
    ]

    const mockEscrowTransactions: EscrowTransaction[] = [
      {
        id: 'esc-1',
        project_id: 'proj-1',
        project_title: 'E-commerce Website Redesign',
        client_name: 'TechCorp Inc.',
        amount: 2500,
        status: 'held',
        created_at: '2024-02-15',
        milestone: 'Phase 2 Completion'
      },
      {
        id: 'esc-2',
        project_id: 'proj-2',
        project_title: 'Mobile App Development',
        client_name: 'StartupXYZ',
        amount: 8000,
        status: 'released',
        created_at: '2024-01-20',
        released_at: '2024-02-10',
        milestone: 'MVP Delivery'
      }
    ]

    setInvoices(mockInvoices)
    setExpenses(mockExpenses)
  }, [])

  // Financial calculations
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)
  
  // Financial analytics
  const totalRevenue = earnings;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netIncome = paidAmount - totalExpenses
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // Calculate total escrow amount from invoices
  const totalEscrow = invoices
    .filter(invoice => invoice.status === 'sent' || invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'held': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'released': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'disputed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'refunded': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'sent': return <Clock className="h-4 w-4 text-blue-600" />
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-gray-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'held': return <Clock className="h-4 w-4 text-blue-600" />
      case 'released': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'disputed': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'refunded': return <AlertCircle className="h-4 w-4 text-orange-600" />
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const revenueData = [
    { month: 'Jan', revenue: 12500, expenses: 3200 },
    { month: 'Feb', revenue: 15800, expenses: 4100 },
    { month: 'Mar', revenue: 18200, expenses: 4800 },
    { month: 'Apr', revenue: 21500, expenses: 5200 },
    { month: 'May', revenue: 19800, expenses: 4900 },
    { month: 'Jun', revenue: 23400, expenses: 5600 },
  ]

  const expenseCategories = [
    { name: 'Software & Tools', value: 850, color: '#0088FE' },
    { name: 'Marketing', value: 1200, color: '#00C49F' },
    { name: 'Equipment', value: 650, color: '#FFBB28' },
    { name: 'Training', value: 400, color: '#FF8042' },
    { name: 'Other', value: 300, color: '#8884D8' },
  ]

  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => {
    const isOverdue = invoice.status === 'overdue'
    const daysOverdue = isOverdue ? 
      Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)) : 0

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">
                {invoice.invoice_number}
              </CardTitle>
              <CardDescription className="mt-1">
                {invoice.client_name} • {invoice.project_title}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Invoice
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Client
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge className={getStatusColor(invoice.status)}>
              {invoice.status.toUpperCase()}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive">
                {daysOverdue} days overdue
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatCurrency(invoice.amount)}</span>
              <div className="text-right text-sm text-muted-foreground">
                <p>Due: {formatDate(invoice.due_date)}</p>
                {invoice.paid_date && (
                  <p className="text-green-600">Paid: {formatDate(invoice.paid_date)}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const EscrowCard = ({ transaction }: { transaction: EscrowTransaction }) => {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">
                {transaction.milestone}
              </CardTitle>
              <CardDescription className="mt-1">
                {transaction.client_name} • {transaction.project_title}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatCurrency(transaction.amount)}</span>
              <div className="text-right text-sm text-muted-foreground">
                <p>Created: {formatDate(transaction.created_at)}</p>
                {transaction.released_at && (
                  <p className="text-green-600">Released: {formatDate(transaction.released_at)}</p>
                )}
              </div>
            </div>
            
            {transaction.status === 'held' && (
              <div className="pt-2">
                <Button size="sm" className="w-full">
                  Request Release
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Hub</h1>
          <p className="text-muted-foreground">
            Manage your invoices, escrow payments, and financial analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Generate a professional invoice for your client.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="techcorp">TechCorp Inc.</SelectItem>
                        <SelectItem value="startupxyz">StartupXYZ</SelectItem>
                        <SelectItem value="agency">Design Agency Co.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="project">Project</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" placeholder="5000" />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input id="due-date" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Invoice description..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsInvoiceDialogOpen(false)}>
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEscrowDialogOpen} onOpenChange={setIsEscrowDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PiggyBank className="mr-2 h-4 w-4" />
                Setup Escrow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Setup Escrow Payment</DialogTitle>
                <DialogDescription>
                  Create a secure escrow transaction for project milestones.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="escrow-project">Project</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="escrow-amount">Amount</Label>
                    <Input id="escrow-amount" type="number" placeholder="2500" />
                  </div>
                  <div>
                    <Label htmlFor="milestone">Milestone</Label>
                    <Input id="milestone" placeholder="e.g., Phase 1 Completion" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="escrow-terms">Terms & Conditions</Label>
                  <Textarea 
                    id="escrow-terms" 
                    placeholder="Define the conditions for payment release..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEscrowDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsEscrowDialogOpen(false)}>
                  Setup Escrow
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earnings)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              +15.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              +8.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDownLeft className="mr-1 h-3 w-3 text-red-600" />
              -3.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escrow Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEscrow)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              Secure payments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and expenses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2"
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Monthly expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {expenseCategories.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices Grid */}
          {filteredInvoices.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first invoice.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <div className="mt-6">
                  <Button onClick={() => setIsInvoiceDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="escrow" className="space-y-6">
          {invoices.filter(invoice => invoice.status === 'sent' || invoice.status === 'paid').length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {invoices
                .filter(invoice => invoice.status === 'sent' || invoice.status === 'paid')
                .map((invoice) => {
                  // Convert invoice to escrow transaction format
                  const escrowTransaction: EscrowTransaction = {
                    id: invoice.id,
                    project_id: invoice.project_id,
                    project_title: invoice.project_title,
                    client_name: invoice.client_name,
                    amount: invoice.amount,
                    status: invoice.status === 'paid' ? 'released' : 'held',
                    created_at: invoice.created_at,
                    released_at: invoice.paid_date,
                    milestone: `Invoice ${invoice.invoice_number}`
                  };
                  return (
                    <EscrowCard key={invoice.id} transaction={escrowTransaction} />
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <PiggyBank className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No escrow transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Setup secure escrow payments for your projects.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsEscrowDialogOpen(true)}>
                  <PiggyBank className="mr-2 h-4 w-4" />
                  Setup Escrow
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Payment Time</span>
                  <span className="text-sm font-medium">12 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Success Rate</span>
                  <span className="text-sm font-medium">96%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Repeat Clients</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Recurring Revenue</span>
                  <span className="text-sm font-medium">{formatCurrency(18500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <span className="text-sm font-medium">74%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Growth Rate</span>
                  <span className="text-sm font-medium">+12.3%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure your payment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-terms">Default Payment Terms</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Net 15</SelectItem>
                      <SelectItem value="30">Net 30</SelectItem>
                      <SelectItem value="45">Net 45</SelectItem>
                      <SelectItem value="60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escrow Settings</CardTitle>
                <CardDescription>Configure escrow payment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-release escrow</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically release payments after project milestones
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dispute resolution</p>
                    <p className="text-sm text-muted-foreground">
                      Enable third-party dispute resolution
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 