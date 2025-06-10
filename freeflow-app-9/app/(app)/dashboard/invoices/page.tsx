'use client'

import { useState } from 'react'
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, Download, Send, 
  Edit3, Copy, Trash2, FileText, DollarSign, Calendar, User,
  Clock, CheckCircle, AlertCircle, X, Printer, Mail, Settings,
  CreditCard, Receipt, TrendingUp, Package, Calculator
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Invoice {
  id: string
  number: string
  client: {
    name: string
    email: string
    address: string
    company?: string
  }
  project: string
  date: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  terms?: string
  currency: string
}

export default function InvoicesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-2024-001',
      client: {
        name: 'John Smith',
        email: 'john@techcorp.com',
        company: 'TechCorp Solutions',
        address: '123 Business St, San Francisco, CA 94105'
      },
      project: 'Website Redesign',
      date: '2024-06-01',
      dueDate: '2024-06-15',
      status: 'sent',
      currency: 'USD',
      items: [
        {
          id: '1',
          description: 'UI/UX Design - Homepage',
          quantity: 1,
          rate: 2500,
          amount: 2500
        },
        {
          id: '2',
          description: 'Frontend Development',
          quantity: 40,
          rate: 125,
          amount: 5000
        }
      ],
      subtotal: 7500,
      tax: 675,
      total: 8175,
      notes: 'Thank you for your business!',
      terms: 'Payment due within 15 days'
    },
    {
      id: '2',
      number: 'INV-2024-002',
      client: {
        name: 'Sarah Johnson',
        email: 'sarah@fashion.com',
        company: 'Fashion Forward Inc.',
        address: '456 Style Ave, New York, NY 10001'
      },
      project: 'Mobile App Design',
      date: '2024-06-10',
      dueDate: '2024-06-25',
      status: 'paid',
      currency: 'USD',
      items: [
        {
          id: '1',
          description: 'Mobile App UI Design',
          quantity: 1,
          rate: 3000,
          amount: 3000
        }
      ],
      subtotal: 3000,
      tax: 270,
      total: 3270,
      notes: 'Pleasure working with you!',
      terms: 'Payment due within 15 days'
    },
    {
      id: '3',
      number: 'INV-2024-003',
      client: {
        name: 'Mike Chen',
        email: 'mike@startup.com',
        company: 'Startup Ventures',
        address: '789 Innovation Blvd, Austin, TX 73301'
      },
      project: 'Brand Identity Package',
      date: '2024-06-12',
      dueDate: '2024-06-27',
      status: 'overdue',
      currency: 'USD',
      items: [
        {
          id: '1',
          description: 'Logo Design',
          quantity: 1,
          rate: 1500,
          amount: 1500
        },
        {
          id: '2',
          description: 'Brand Guidelines',
          quantity: 1,
          rate: 800,
          amount: 800
        }
      ],
      subtotal: 2300,
      tax: 207,
      total: 2507,
      notes: 'Payment reminder sent.',
      terms: 'Payment due within 15 days'
    }
  ])

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0)
  const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, invoice) => sum + invoice.total, 0)
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, invoice) => sum + invoice.total, 0)

  const [newInvoice, setNewInvoice] = useState({
    client: { name: '', email: '', company: '', address: '' },
    project: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
    notes: '',
    terms: 'Payment due within 15 days',
    currency: 'USD'
  })

  const addInvoiceItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }]
    }))
  }

  const removeInvoiceItem = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateSubtotal = () => {
    return newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  }

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.09 // 9% tax rate
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    return subtotal + tax
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-1">Create, send, and track professional invoices</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Invoiced</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${paidAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${overdueAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{invoice.number}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{invoice.client.name} • {invoice.project}</p>
                    <p className="text-xs text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${invoice.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{invoice.currency}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice)
                        setShowPreviewModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Invoice</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input 
                      id="client-name"
                      placeholder="John Smith"
                      value={newInvoice.client.name}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        client: { ...prev.client, name: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-email">Email</Label>
                    <Input 
                      id="client-email"
                      type="email"
                      placeholder="john@company.com"
                      value={newInvoice.client.email}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        client: { ...prev.client, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-company">Company (Optional)</Label>
                    <Input 
                      id="client-company"
                      placeholder="Company Name"
                      value={newInvoice.client.company}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        client: { ...prev.client, company: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input 
                      id="project-name"
                      placeholder="Website Redesign"
                      value={newInvoice.project}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        project: e.target.value
                      }))}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="client-address">Address</Label>
                  <Textarea 
                    id="client-address"
                    placeholder="123 Business St, City, State, ZIP"
                    value={newInvoice.client.address}
                    onChange={(e) => setNewInvoice(prev => ({
                      ...prev,
                      client: { ...prev.client, address: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input 
                      id="due-date"
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice(prev => ({
                        ...prev,
                        dueDate: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={newInvoice.currency} onValueChange={(value) => setNewInvoice(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Invoice Items</h3>
                  <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Label>Description</Label>
                        <Input 
                          placeholder="Service description"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...newInvoice.items]
                            newItems[index].description = e.target.value
                            setNewInvoice(prev => ({ ...prev, items: newItems }))
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Qty</Label>
                        <Input 
                          type="number"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...newInvoice.items]
                            newItems[index].quantity = parseInt(e.target.value) || 0
                            setNewInvoice(prev => ({ ...prev, items: newItems }))
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Rate</Label>
                        <Input 
                          type="number"
                          placeholder="100"
                          value={item.rate}
                          onChange={(e) => {
                            const newItems = [...newInvoice.items]
                            newItems[index].rate = parseFloat(e.target.value) || 0
                            setNewInvoice(prev => ({ ...prev, items: newItems }))
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Amount</Label>
                        <div className="p-2 bg-gray-50 rounded border text-sm">
                          ${(item.quantity * item.rate).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {newInvoice.items.length > 1 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeInvoiceItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (9%):</span>
                    <span>${calculateTax(calculateSubtotal()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Thank you for your business!"
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea 
                    id="terms"
                    placeholder="Payment due within 15 days"
                    value={newInvoice.terms}
                    onChange={(e) => setNewInvoice(prev => ({
                      ...prev,
                      terms: e.target.value
                    }))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="outline">
                  Save as Draft
                </Button>
                <Button onClick={() => setShowCreateModal(false)}>
                  Create & Send Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Preview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreviewModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Invoice Preview Content */}
              <div className="space-y-8 bg-white p-8 border rounded-lg">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-indigo-600">FreeflowZee</h1>
                    <p className="text-gray-600">Professional Freelance Services</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                    <p className="text-gray-600">{selectedInvoice.number}</p>
                  </div>
                </div>

                {/* Client & Invoice Info */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                    <div className="text-gray-600">
                      <p className="font-medium">{selectedInvoice.client.name}</p>
                      {selectedInvoice.client.company && <p>{selectedInvoice.client.company}</p>}
                      <p>{selectedInvoice.client.address}</p>
                      <p>{selectedInvoice.client.email}</p>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice Date:</span>
                        <span className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project:</span>
                        <span className="font-medium">{selectedInvoice.project}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Rate</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3">{item.description}</td>
                          <td className="text-right py-3">{item.quantity}</td>
                          <td className="text-right py-3">${item.rate.toFixed(2)}</td>
                          <td className="text-right py-3">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${selectedInvoice.total.toFixed(2)} {selectedInvoice.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms */}
                {(selectedInvoice.notes || selectedInvoice.terms) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
                    {selectedInvoice.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                        <p className="text-gray-600">{selectedInvoice.notes}</p>
                      </div>
                    )}
                    {selectedInvoice.terms && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                        <p className="text-gray-600">{selectedInvoice.terms}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
