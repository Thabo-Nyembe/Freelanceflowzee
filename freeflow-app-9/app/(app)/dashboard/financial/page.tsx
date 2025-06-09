'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, Plus, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FinancialPage() {
  const [transactions] = useState([
    {
      id: 1,
      type: 'income',
      description: 'Logo Design Project - ABC Corp',
      amount: 2500,
      date: '2024-01-15',
      status: 'completed',
      client: 'ABC Corp'
    },
    {
      id: 2,
      type: 'income',
      description: 'Website Development - XYZ Inc',
      amount: 5000,
      date: '2024-01-12',
      status: 'pending',
      client: 'XYZ Inc'
    },
    {
      id: 3,
      type: 'expense',
      description: 'Adobe Creative Suite License',
      amount: 599,
      date: '2024-01-10',
      status: 'completed',
      client: 'Adobe'
    },
    {
      id: 4,
      type: 'income',
      description: 'Brand Identity Package - StartupCo',
      amount: 3200,
      date: '2024-01-08',
      status: 'completed',
      client: 'StartupCo'
    }
  ])

  const [invoices] = useState([
    {
      id: 'INV-001',
      client: 'ABC Corporation',
      amount: 2500,
      dueDate: '2024-02-01',
      status: 'paid',
      issueDate: '2024-01-15'
    },
    {
      id: 'INV-002',
      client: 'XYZ Inc',
      amount: 5000,
      dueDate: '2024-01-25',
      status: 'pending',
      issueDate: '2024-01-10'
    },
    {
      id: 'INV-003',
      client: 'StartupCo',
      amount: 3200,
      dueDate: '2024-01-20',
      status: 'overdue',
      issueDate: '2024-01-05'
    }
  ])

  const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const netProfit = totalIncome - totalExpenses
  const pendingPayments = transactions.filter(t => t.type === 'income' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'overdue':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financial</h1>
          <p className="text-gray-600">Track your income, expenses, and financial performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">${totalIncome.toLocaleString()}</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
                <div className="flex items-center text-sm text-red-600">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  +5% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">${netProfit.toLocaleString()}</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">${pendingPayments.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{transactions.filter(t => t.status === 'pending').length} invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Details */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className={`h-4 w-4 ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.client} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>Track and manage your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invoice.id}</p>
                        <p className="text-sm text-gray-500">{invoice.client}</p>
                        <p className="text-xs text-gray-400">
                          Issued: {invoice.issueDate} • Due: {invoice.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${invoice.amount.toLocaleString()}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
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