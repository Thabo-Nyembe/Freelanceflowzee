'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PaymentProps {
  amount: number
  projectId: string
}

interface PaymentHistory {
  id: string
  amount: number
  date: string
  status: 'succeeded' | 'failed' | 'pending'
  method: string
}

const Payment = ({ amount, projectId }: PaymentProps) => {
  const _supabase = createClient()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [showHistory, setShowHistory] = useState<any>(false)
  const [billingDetails, setBillingDetails] = useState<any>({
    name: '',
    email: '',
    address: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentStatus, setPaymentStatus] = useState<string>('')
  const [paymentHistory] = useState<PaymentHistory[]>([
    {
      id: '1',
      amount: 500,
      date: '2024-01-15',
      status: 'succeeded',
      method: 'Credit Card'
    },
    {
      id: '2',
      amount: 1000,
      date: '2024-02-01',
      status: 'succeeded',
      method: 'Bank Transfer'
    }
  ])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!billingDetails.name) {
      newErrors.name = 'Name is required'
    }

    if (!billingDetails.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(billingDetails.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!billingDetails.address) {
      newErrors.address = 'Address is required'
    }

    if (!selectedMethod) {
      newErrors.method = 'Please select a payment method'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      // In a real app, we would handle the payment here
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPaymentStatus('Payment successful!')
    } catch (error) {
      setPaymentStatus('Payment failed. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            <p className="text-gray-500">Project ID: {projectId}</p>
          </div>

          <div data-testid="payment-methods" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger data-testid="payment-method-select">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
              {errors.method && <p className="text-red-500 text-sm mt-1">{errors.method}</p>}
            </div>

            {selectedMethod === 'card' && (
              <div data-testid="card-element" className="p-4 border rounded">
                {/* In a real app, this would be the Stripe Card Element */}
                <p className="text-center text-gray-500">Credit Card Form Placeholder</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  data-testid="billing-name"
                  value={billingDetails.name}
                  onChange={e => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  data-testid="billing-email"
                  type="email"
                  value={billingDetails.email}
                  onChange={e => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Billing Address</label>
                <Input
                  data-testid="billing-address"
                  value={billingDetails.address}
                  onChange={e => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
            </div>

            <Button
              data-testid="submit-payment"
              className="w-full"
              onClick={handleSubmit}
            >
              Pay Now
            </Button>

            {paymentStatus && (
              <div
                className={`text-center p-2 rounded ${
                  paymentStatus.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {paymentStatus}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button
                  data-testid="payment-history-button"
                  variant="outline"
                >
                  Payment History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Previous Payments</DialogTitle>
                </DialogHeader>
                <ScrollArea data-testid="payment-history" className="h-[400px]">
                  <div className="space-y-4">
                    {paymentHistory.map(payment => (
                      <Card key={payment.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">${payment.amount}</p>
                              <p className="text-sm text-gray-500">{payment.date}</p>
                            </div>
                            <div>
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {payment.status}
                              </span>
                              <p className="text-sm text-gray-500 mt-1">{payment.method}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Payment 