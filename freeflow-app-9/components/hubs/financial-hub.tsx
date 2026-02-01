"use client"

import React, { useState } from 'react'
import { toast } from 'sonner'
import {
  Download,
  MoreHorizontal,
  Send,
  Edit,
  Trash2,
  Eye,
  FileText,
  Mail,
  Printer,
  X,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
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

export default function FinancialHub({ invoices, _expenses, escrowTransactions, _userId }: FinancialHubProps) {
  // Dialog states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', message: '' })
  const [isSending, setIsSending] = useState(false)

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

  const openInvoiceViewer = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDialog(true)
  }

  const openTransactionDetails = (transaction: EscrowTransaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDialog(true)
  }

  const openEmailDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setEmailForm({
      to: '',
      subject: `Invoice ${invoice.invoice_number} - ${invoice.project_title}`,
      message: `Dear ${invoice.client_name},\n\nPlease find attached invoice ${invoice.invoice_number} for ${formatCurrency(invoice.amount)}.\n\nDue date: ${formatDate(invoice.due_date)}\n\nThank you for your business.`
    })
    setShowEmailDialog(true)
  }

  const handleDownloadPDF = async (invoice: Invoice) => {
    toast.loading('Generating PDF...', { id: 'pdf-download' })
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Create a simple text representation for download
    const invoiceText = `
INVOICE
=======
Invoice Number: ${invoice.invoice_number}
Client: ${invoice.client_name}
Project: ${invoice.project_title}
Amount: ${formatCurrency(invoice.amount)}
Status: ${invoice.status.toUpperCase()}
Due Date: ${formatDate(invoice.due_date)}
${invoice.paid_date ? `Paid Date: ${formatDate(invoice.paid_date)}` : ''}
    `.trim()

    const blob = new Blob([invoiceText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoice.invoice_number}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Invoice downloaded', { id: 'pdf-download', description: `${invoice.invoice_number}.txt saved` })
  }

  const handleSendEmail = async () => {
    if (!emailForm.to || !selectedInvoice) return

    setIsSending(true)
    toast.loading('Sending email...', { id: 'email-send' })

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Email sent successfully', {
      id: 'email-send',
      description: `Invoice sent to ${emailForm.to}`
    })

    setIsSending(false)
    setShowEmailDialog(false)
    setEmailForm({ to: '', subject: '', message: '' })
  }

  const handleDisputeTransaction = async (transaction: EscrowTransaction) => {
    toast.loading('Filing dispute...', { id: 'dispute' })
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Dispute filed', {
      id: 'dispute',
      description: `Case opened for ${transaction.milestone}`
    })
    setShowTransactionDialog(false)
  }

  const handleReleaseEscrow = async (transaction: EscrowTransaction) => {
    toast.loading('Releasing funds...', { id: 'release' })
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Funds released', {
      id: 'release',
      description: `${formatCurrency(transaction.amount)} sent to freelancer`
    })
    setShowTransactionDialog(false)
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
                            <DropdownMenuItem onClick={() => openInvoiceViewer(invoice)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEmailDialog(invoice)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send to Client
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info('Edit Mode', { description: 'Invoice editing coming soon' })}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => toast.warning('Confirm Deletion', { description: 'Are you sure you want to delete this invoice?' })}>
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
                        <Button size="sm" className="flex-1" onClick={() => openInvoiceViewer(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(invoice)}>
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEmailDialog(invoice)}>
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
                    <Button size="sm" className="flex-1" onClick={() => openTransactionDetails(transaction)}>
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

        {/* Invoice Viewer Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedInvoice?.invoice_number}
              </DialogTitle>
              <DialogDescription>
                Invoice details for {selectedInvoice?.client_name}
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6">
                {/* Status and Amount Header */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Badge className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {selectedInvoice.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {selectedInvoice.status === 'sent' && <Clock className="h-3 w-3 mr-1" />}
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-3xl font-bold">{formatCurrency(selectedInvoice.amount)}</span>
                </div>

                <Separator />

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedInvoice.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p className="font-medium">{selectedInvoice.project_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(selectedInvoice.due_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvoice.paid_date ? 'Paid Date' : 'Status'}
                    </p>
                    <p className={`font-medium ${selectedInvoice.paid_date ? 'text-green-600' : ''}`}>
                      {selectedInvoice.paid_date
                        ? formatDate(selectedInvoice.paid_date)
                        : selectedInvoice.status === 'overdue'
                          ? `${Math.floor((new Date().getTime() - new Date(selectedInvoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue`
                          : 'Pending payment'
                      }
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Line Items Preview */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Invoice Items</p>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span>{selectedInvoice.project_title}</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button variant="outline" onClick={() => selectedInvoice && handleDownloadPDF(selectedInvoice)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => {
                setShowInvoiceDialog(false)
                if (selectedInvoice) openEmailDialog(selectedInvoice)
              }}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Invoice Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Invoice
              </DialogTitle>
              <DialogDescription>
                Send {selectedInvoice?.invoice_number} to your client
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">To</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  rows={6}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isSending || !emailForm.to}>
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transaction Details Dialog */}
        <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Escrow Transaction
              </DialogTitle>
              <DialogDescription>
                {selectedTransaction?.milestone} - {selectedTransaction?.project_title}
              </DialogDescription>
            </DialogHeader>

            {selectedTransaction && (
              <div className="space-y-6">
                {/* Status and Amount Header */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Badge className={getStatusColor(selectedTransaction.status)}>
                      {selectedTransaction.status === 'released' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {selectedTransaction.status === 'disputed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {selectedTransaction.status === 'held' && <Clock className="h-3 w-3 mr-1" />}
                      {selectedTransaction.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-3xl font-bold">{formatCurrency(selectedTransaction.amount)}</span>
                </div>

                <Separator />

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedTransaction.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p className="font-medium">{selectedTransaction.project_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Milestone</p>
                    <p className="font-medium">{selectedTransaction.milestone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(selectedTransaction.created_at)}</p>
                  </div>
                  {selectedTransaction.release_date && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Released</p>
                      <p className="font-medium text-green-600">{formatDate(selectedTransaction.release_date)}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Escrow Timeline */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Transaction Timeline</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Funds Deposited</p>
                        <p className="text-sm text-muted-foreground">{formatDate(selectedTransaction.created_at)}</p>
                      </div>
                    </div>
                    {selectedTransaction.status === 'held' && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">In Escrow</p>
                          <p className="text-sm text-muted-foreground">Awaiting milestone completion</p>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.release_date && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Funds Released</p>
                          <p className="text-sm text-muted-foreground">{formatDate(selectedTransaction.release_date)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              {selectedTransaction?.status === 'held' && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => selectedTransaction && handleDisputeTransaction(selectedTransaction)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    File Dispute
                  </Button>
                  <Button onClick={() => selectedTransaction && handleReleaseEscrow(selectedTransaction)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Release Funds
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
} 