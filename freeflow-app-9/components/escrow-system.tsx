import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Shield, Lock, Unlock, DollarSign, Download, AlertCircle, CheckCircle } from "lucide-react"
// Add this import at the top
import { Wallet, CreditCard, BanknoteIcon, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function EscrowSystem() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Escrow Management</h2>
          <p className="text-lg text-slate-500 mt-1">Secure payment protection for your projects</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
          <DollarSign className="h-4 w-4 mr-2" />
          Request New Escrow
        </Button>
      </div>

      {/* Escrow Overview */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
            <p className="text-3xl font-light text-emerald-800 mb-1">$12,450</p>
            <p className="text-sm text-emerald-600">Total Protected</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Lock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <p className="text-3xl font-light text-blue-800 mb-1">3</p>
            <p className="text-sm text-blue-600">Active Escrows</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-3" />
            <p className="text-3xl font-light text-amber-800 mb-1">1</p>
            <p className="text-sm text-amber-600">Pending Release</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <p className="text-3xl font-light text-purple-800 mb-1">$47,250</p>
            <p className="text-sm text-purple-600">Total Released</p>
          </CardContent>
        </Card>
      </div>

      {/* Day to Day Fund */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300 mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Day to Day Fund
          </CardTitle>
          <p className="text-sm text-slate-500">Manage your running costs and daily expenses</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-blue-600 mb-1">Available Balance</p>
                <p className="text-2xl font-light text-blue-800">$3,250.00</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-emerald-600 mb-1">Monthly Income</p>
                <p className="text-2xl font-light text-emerald-800">$8,450.00</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-amber-600 mb-1">Monthly Expenses</p>
                <p className="text-2xl font-light text-amber-800">$5,200.00</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50">
              <BanknoteIcon className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Recent Transactions</h4>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">Payment Received</p>
                  <p className="text-xs text-slate-500">From Acme Corp</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-600">+$2,500.00</p>
                <p className="text-xs text-slate-500">Jan 20, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">Software Subscription</p>
                  <p className="text-xs text-slate-500">Adobe Creative Cloud</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">-$52.99</p>
                <p className="text-xs text-slate-500">Jan 18, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">Office Supplies</p>
                  <p className="text-xs text-slate-500">Office Depot</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">-$125.47</p>
                <p className="text-xs text-slate-500">Jan 15, 2024</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
              View All Transactions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Escrows */}
      <div className="grid grid-cols-2 gap-8">
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Active Escrows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Brand Identity Design</h4>
                  <p className="text-sm text-slate-600">Acme Corporation</p>
                  <p className="text-xs text-slate-500 mt-1">Created: Jan 10, 2024</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-light text-emerald-600">$5,000.00</span>
                <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Lock className="h-4 w-4 mr-1" />
                  Secured
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                Funds will be released upon project completion and client approval
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">E-commerce Platform</h4>
                  <p className="text-sm text-slate-600">Tech Startup Inc.</p>
                  <p className="text-xs text-slate-500 mt-1">Created: Jan 5, 2024</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700">In Progress</Badge>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-light text-emerald-600">$7,450.00</span>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  <Lock className="h-4 w-4 mr-1" />
                  Secured
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                Milestone-based release: 50% on design approval, 50% on completion
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready for Release */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Ready for Release</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Website Redesign</h4>
                  <p className="text-sm text-slate-600">Creative Agency Ltd.</p>
                  <p className="text-xs text-slate-500 mt-1">Completed: Jan 22, 2024</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">Ready</Badge>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-light text-emerald-600">$3,200.00</span>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Unlock className="h-4 w-4 mr-1" />
                  Release Funds
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Project Delivery</p>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Enter release password"
                      className="bg-white/70 border-emerald-200 focus:border-emerald-300"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Client will receive download link upon password verification
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Payment Released</p>
                  <p className="text-sm text-slate-500">Mobile App Design - StartupXYZ</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-600">+$4,500.00</p>
                <p className="text-xs text-slate-500">Jan 20, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50/50 border border-blue-200/50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Escrow Created</p>
                  <p className="text-sm text-slate-500">Brand Identity - Acme Corp</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">$5,000.00</p>
                <p className="text-xs text-slate-500">Jan 10, 2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
