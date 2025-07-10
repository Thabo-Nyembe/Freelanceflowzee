"use client"

import React from 'react'
import {
  Download,
  MoreHorizontal,
  Send,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// types
type Invoice = {
    id: string;
    invoice_number: string;
    client_name: string;
    project_title: string;
    amount: number;
    status: 'paid' | 'sent' | 'overdue' | 'draft' | 'cancelled';
    due_date: string;
    paid_date?: string;
};

type Expense = {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
};

type EscrowTransaction = {
    id: string;
    client_name: string;
    project_title: string;
    milestone: string;
    amount: number;
    status: 'pending' | 'held' | 'released' | 'disputed' | 'refunded';
    created_at: string;
    release_date?: string;
};

// props
interface FinancialHubProps {
  invoices: Invoice[];
  _expenses: Expense[];
  escrowTransactions: EscrowTransaction[];
  _userId: string;
}

export default function FinancialHub({ invoices: unknown, _expenses: unknown, escrowTransactions: unknown, _userId }: FinancialHubProps) {

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
                        {transaction.release_date && (
                            <p className="text-green-600">Released: {formatDate(transaction.release_date)}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                        View Details
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {invoices.map(invoice => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {escrowTransactions.map(transaction => (
                <EscrowCard key={transaction.id} transaction={transaction} />
            ))}
        </div>
    </div>
  )
} 