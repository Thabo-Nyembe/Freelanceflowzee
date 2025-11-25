'use client'

import React from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-react'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Settings:Billing')

export default function BillingPage() {
  const handleUpdateBilling = () => {
    logger.info('Update billing information opened')

    toast.info('Update Billing Information', {
      description: 'Manage payment method, billing address, tax info, and invoices - Securely encrypted'
    })
  }

  const handleCancelSubscription = () => {
    const activeUntil = 'January 15, 2025'

    logger.info('Cancel subscription initiated')

    if (confirm('⚠️ Cancel Subscription?\n\nYou will:\n• Lose access to premium features\n• Keep your data until end of billing period\n• Can resubscribe anytime\n\nContinue with cancellation?')) {
      logger.info('Subscription canceled', {
        activeUntil,
        newPlan: 'free'
      })

      toast.info('Subscription Canceled', {
        description: `Active until ${activeUntil}. You will switch to the free plan after that`
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900">Professional Plan</h3>
                    <p className="text-purple-700">Full access to all features</p>
                  </div>
                  <Badge className="bg-purple-600 text-white">Active</Badge>
                </div>
                <div className="mt-3 text-2xl font-bold text-purple-900">
                  $29/month
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Next billing date: January 15, 2024</p>
                <p className="text-sm text-gray-600">Payment method: **** **** **** 4242</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleUpdateBilling}>
                  Change Plan
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                    <div>
                      <p className="font-medium">**** **** **** 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/25</p>
                    </div>
                  </div>
                  <Badge variant="outline">Default</Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleUpdateBilling}>
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: 'Dec 15, 2023', amount: '$29.00', status: 'Paid' },
              { date: 'Nov 15, 2023', amount: '$29.00', status: 'Paid' },
              { date: 'Oct 15, 2023', amount: '$29.00', status: 'Paid' }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.date}</p>
                  <p className="text-sm text-gray-500">Professional Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{invoice.amount}</p>
                  <Badge variant="outline" className="text-green-600">
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
