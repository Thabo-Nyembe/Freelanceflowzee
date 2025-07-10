"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Plus, 
  Search,
  _Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  _Calendar,
  DollarSign,
  _Clock,
  CheckCircle,
  XCircle,
  _AlertCircle
} from 'lucide-react'

export default function InvoicesPage() {
  const [selectedStatus, setSelectedStatus] = useState<any>('all')
  const [searchTerm, setSearchTerm] = useState<any>('')

  // Mock invoice data
  const invoices = [
    {
      id: 'INV-001',
      client: 'Acme Corp',
      project: 'Brand Identity Package',
      amount: 5000,
      status: 'paid',
      dueDate: '2024-01-15',
      issueDate: '2024-01-01',
      description: 'Complete brand identity design including logo, colors, and guidelines'
    },
    {
      id: 'INV-002',
      client: 'Tech Startup',
      project: 'Website Development',
      amount: 3500,
      status: 'pending',
      dueDate: '2024-01-20',
      issueDate: '2024-01-10',
      description: 'Modern responsive website with e-commerce functionality'
    },
    {
      id: 'INV-003',
      client: 'Design Agency',
      project: 'UI/UX Consultation',
      amount: 2000,
      status: 'overdue',
      dueDate: '2024-01-05',
      issueDate: '2023-12-20',
      description: 'User experience analysis and design recommendations'
    },
    {
      id: 'INV-004',
      client: 'Local Business',
      project: 'Social Media Package',
      amount: 1500,
      status: 'draft',
      dueDate: '2024-01-25',
      issueDate: '2024-01-15',
      description: 'Complete social media content and management package'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'overdue': return <XCircle className="h-4 w-4" />
      case 'draft': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your invoices and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 kazi-text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-accent">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{invoices.length} invoices</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{invoices.filter(inv => inv.status === 'paid').length} paid</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{invoices.filter(inv => inv.status === 'pending').length} pending</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{invoices.filter(inv => inv.status === 'overdue').length} overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>Create, track, and manage your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="grid w-full grid-cols-5 sm:w-auto">
                <TabsTrigger value="all" onClick={() => setSelectedStatus('all')}>All</TabsTrigger>
                <TabsTrigger value="paid" onClick={() => setSelectedStatus('paid')}>Paid</TabsTrigger>
                <TabsTrigger value="pending" onClick={() => setSelectedStatus('pending')}>Pending</TabsTrigger>
                <TabsTrigger value="overdue" onClick={() => setSelectedStatus('overdue')}>Overdue</TabsTrigger>
                <TabsTrigger value="draft" onClick={() => setSelectedStatus('draft')}>Draft</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="kazi-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{invoice.id}</h3>
                              <Badge className={getStatusColor(invoice.status)}>
                                {getStatusIcon(invoice.status)}
                                <span className="ml-1 capitalize">{invoice.status}</span>
                              </Badge>
                            </div>
                            <p className="text-gray-600 font-medium">{invoice.client}</p>
                            <p className="text-sm text-gray-500">{invoice.project}</p>
                            <p className="text-xs text-gray-400 mt-1">{invoice.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold kazi-text-accent mb-1">
                            ${invoice.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Issued: {invoice.issueDate}</p>
                            <p>Due: {invoice.dueDate}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredInvoices.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No invoices found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
