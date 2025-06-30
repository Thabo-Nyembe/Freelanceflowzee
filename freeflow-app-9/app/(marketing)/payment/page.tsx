'use client'

import { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentForm } from '@/components/payment/payment-form'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PaymentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="project-title">
            Premium Brand Identity Package
          </h1>
          <p className="text-gray-600 mt-2" data-testid="project-description">
            Complete brand identity design package with logo, guidelines, and assets
          </p>
          
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mt-6 max-w-md mx-auto" data-testid="locked-notice">
            <h3 className="font-semibold text-yellow-800">🔒 Premium Content Locked</h3>
            <p className="text-yellow-700 mt-1">This project contains premium content. Complete payment to unlock full access.</p>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </div>
    </div>
  )
} 