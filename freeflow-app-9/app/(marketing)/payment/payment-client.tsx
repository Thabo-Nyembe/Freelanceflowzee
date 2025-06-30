'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentClientProps {
  plans: any[]
}

export default function PaymentClient({ plans }: PaymentClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro')

  const formatCardNumber = (value: string): string => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '')
    // Split into groups of 4
    const parts = []
    for (let i = 0; i < cleanValue.length; i += 4) {
      parts.push(cleanValue.substring(i, i + 4))
    }
    return parts.join(' ')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id ? 'ring-2 ring-blue-500' : '
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">${plan.price}/month</div>
              <ul className="space-y-2">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          Get Started with {plans.find(p => p.id === selectedPlan)?.name || 'Pro'}
        </Button>
      </div>
    </div>
  )
} 