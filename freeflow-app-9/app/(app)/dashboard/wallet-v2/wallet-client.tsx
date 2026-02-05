'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Wallet, CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft,
  Plus, Send, Download, RefreshCw, TrendingUp, TrendingDown,
  Clock, CheckCircle2, XCircle, AlertCircle, Building2, Globe,
  Shield, Eye, EyeOff, Copy, QrCode, History, Settings,
  Banknote, PiggyBank, Landmark, Receipt, Loader2
} from 'lucide-react'

// Demo wallet data
const demoWalletData = {
  balance: 45892.50,
  pendingBalance: 2340.00,
  currency: 'USD',
  walletId: 'WAL-2024-001',
  createdAt: '2024-01-15',
}

const demoTransactions = [
  { id: '1', type: 'credit', amount: 5000, description: 'Client Payment - Website Project', date: '2024-01-28', status: 'completed', from: 'Acme Corp' },
  { id: '2', type: 'debit', amount: 1200, description: 'Withdrawal to Bank', date: '2024-01-27', status: 'completed', to: 'Chase Bank ****4521' },
  { id: '3', type: 'credit', amount: 3500, description: 'Client Payment - Mobile App', date: '2024-01-26', status: 'completed', from: 'TechStart Inc' },
  { id: '4', type: 'debit', amount: 850, description: 'Subscription Payment', date: '2024-01-25', status: 'completed', to: 'Adobe Creative Cloud' },
  { id: '5', type: 'credit', amount: 2340, description: 'Pending Payment - Logo Design', date: '2024-01-24', status: 'pending', from: 'StartupXYZ' },
  { id: '6', type: 'credit', amount: 7500, description: 'Client Payment - E-commerce', date: '2024-01-23', status: 'completed', from: 'Global Retail Co' },
  { id: '7', type: 'debit', amount: 2000, description: 'Withdrawal to Bank', date: '2024-01-22', status: 'completed', to: 'Chase Bank ****4521' },
  { id: '8', type: 'credit', amount: 4200, description: 'Client Payment - Branding', date: '2024-01-20', status: 'completed', from: 'Fashion Brand Ltd' },
]

const demoPaymentMethods = [
  { id: '1', type: 'bank', name: 'Chase Bank', last4: '4521', isDefault: true, verified: true },
  { id: '2', type: 'card', name: 'Visa', last4: '8832', isDefault: false, verified: true },
  { id: '3', type: 'paypal', name: 'PayPal', email: 'user@email.com', isDefault: false, verified: true },
]

export default function WalletClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showBalance, setShowBalance] = useState(true)
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendRecipient, setSendRecipient] = useState('')

  const walletStats = useMemo(() => {
    const totalIn = demoTransactions.filter(t => t.type === 'credit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
    const totalOut = demoTransactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
    const pending = demoTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)

    return { totalIn, totalOut, pending, netFlow: totalIn - totalOut }
  }, [])

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (parseFloat(withdrawAmount) > demoWalletData.balance) {
      toast.error('Insufficient balance')
      return
    }

    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success(`Withdrawal of $${withdrawAmount} initiated`)
    setShowWithdrawDialog(false)
    setWithdrawAmount('')
    setIsLoading(false)
  }

  const handleSend = async () => {
    if (!sendAmount || !sendRecipient) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success(`$${sendAmount} sent to ${sendRecipient}`)
    setShowSendDialog(false)
    setSendAmount('')
    setSendRecipient('')
    setIsLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:bg-none dark:bg-gray-900 rounded-xl overflow-hidden">
      <div className="mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Wallet
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your funds and transactions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => toast.info('Refreshing wallet data...')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showBalance ? 'Hide' : 'Show'} Balance
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="w-8 h-8 opacity-80" />
                <Badge variant="secondary" className="bg-white/20 text-white border-0">Available</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">
                {showBalance ? formatCurrency(demoWalletData.balance) : '••••••'}
              </div>
              <p className="text-emerald-100 text-sm">Current Balance</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-amber-500" />
                <Badge variant="outline" className="border-amber-200 text-amber-600">Pending</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {showBalance ? formatCurrency(demoWalletData.pendingBalance) : '••••••'}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Pending Funds</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ArrowDownLeft className="w-8 h-8 text-green-500" />
                <Badge variant="outline" className="border-green-200 text-green-600">Income</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {showBalance ? formatCurrency(walletStats.totalIn) : '••••••'}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total Received</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ArrowUpRight className="w-8 h-8 text-blue-500" />
                <Badge variant="outline" className="border-blue-200 text-blue-600">Spent</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {showBalance ? formatCurrency(walletStats.totalOut) : '••••••'}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            className="h-auto py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            onClick={() => setShowAddFundsDialog(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Funds
          </Button>
          <Button variant="outline" className="h-auto py-4" onClick={() => setShowWithdrawDialog(true)}>
            <Download className="w-5 h-5 mr-2" />
            Withdraw
          </Button>
          <Button variant="outline" className="h-auto py-4" onClick={() => setShowSendDialog(true)}>
            <Send className="w-5 h-5 mr-2" />
            Send Money
          </Button>
          <Button variant="outline" className="h-auto py-4" onClick={() => toast.info('Opening transaction history...')}>
            <History className="w-5 h-5 mr-2" />
            History
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Transactions */}
              <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {demoTransactions.slice(0, 6).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tx.description}</p>
                              <p className="text-xs text-slate-500">{tx.date} • {tx.from || tx.to}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                            <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                              {tx.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Wallet Info */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Wallet Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Wallet ID</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm">{demoWalletData.walletId}</p>
                      <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText(demoWalletData.walletId)
                        toast.success('Wallet ID copied')
                      }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Currency</p>
                    <p className="font-semibold">{demoWalletData.currency}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Created</p>
                    <p className="font-semibold">{demoWalletData.createdAt}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Verified Account</span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Your wallet is fully verified</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Complete history of your wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {demoTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {tx.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            <p className="text-sm text-slate-500">{tx.date}</p>
                            <p className="text-xs text-slate-400">{tx.from ? `From: ${tx.from}` : `To: ${tx.to}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                            {tx.status === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-methods">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your linked accounts and cards</CardDescription>
                  </div>
                  <Button onClick={() => toast.info('Add payment method dialog')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoPaymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {method.type === 'bank' && <Building2 className="w-6 h-6 text-blue-600" />}
                          {method.type === 'card' && <CreditCard className="w-6 h-6 text-purple-600" />}
                          {method.type === 'paypal' && <Globe className="w-6 h-6 text-blue-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-slate-500">
                            {method.last4 ? `•••• ${method.last4}` : method.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && <Badge>Default</Badge>}
                        {method.verified && <Badge variant="outline" className="text-green-600 border-green-200">Verified</Badge>}
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Wallet Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Two-Factor Authentication</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Transaction Notifications</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Withdrawal Limits</span>
                        <span className="text-sm text-slate-500">$10,000/day</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Default Currency</span>
                        <span className="font-medium">USD</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Auto-withdraw Threshold</span>
                        <span className="text-sm text-slate-500">Disabled</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <span>Email Receipts</span>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Withdraw Dialog */}
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>Transfer funds to your linked bank account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-9"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Available: {formatCurrency(demoWalletData.balance)}</p>
              </div>
              <Button className="w-full" onClick={handleWithdraw} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Withdraw
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Dialog */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Money</DialogTitle>
              <DialogDescription>Transfer funds to another user</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Recipient Email or Wallet ID</label>
                <Input
                  placeholder="email@example.com or WAL-XXXX-XXX"
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-9"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSend} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Money
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Funds Dialog */}
        <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Funds</DialogTitle>
              <DialogDescription>Add money to your wallet</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {[50, 100, 250, 500].map((amount) => (
                  <Button key={amount} variant="outline" onClick={() => {
                    toast.success(`Adding $${amount} to wallet...`)
                    setShowAddFundsDialog(false)
                  }}>
                    ${amount}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input type="number" placeholder="Custom amount" className="pl-9" />
              </div>
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
