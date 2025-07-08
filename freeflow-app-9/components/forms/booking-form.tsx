'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { format, addDays, startOfDay } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CalendarDays, Clock, User, Mail, Phone, CheckCircle, Check, AlertCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isAvailable: boolean
  displayTime: string
}

interface ServiceConfig {
  id: string
  name: string
  duration: number
  price: number
}

interface FormData {
  selectedDate: string
  selectedTime: string
  clientName: string
  clientEmail: string
  clientPhone: string
  notes: string
}

interface BookingFormProps {
  service: ServiceConfig
  className?: string
}

export function BookingForm({ service, className = "" }: BookingFormProps) {
  const [step, setStep] = useState<'datetime' | 'details' | 'payment'>('datetime')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<FormData>({
    mode: 'onChange'
  })

  const watchedDate = watch('selectedDate')
  const watchedTime = watch('selectedTime')

  // Generate simple time slots
  useEffect(() => {
    if (watchedDate) {
      const slots: TimeSlot[] = []
      
      // Generate slots from 9 AM to 6 PM, 30-minute intervals
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
          
          slots.push({
            id: `${hour}-${minute}`,
            startTime: timeString,
            endTime: `${hour + Math.floor((minute + service.duration) / 60)}:${((minute + service.duration) % 60).toString().padStart(2, '0')}`,
            isAvailable: true,
            displayTime
          })
        }
      }
      
      setTimeSlots(slots)
    }
  }, [watchedDate, service.duration])

  const handleFormSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      // Create booking with payment intent
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          timeSlotId: `slot-${data.selectedTime}`,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          notes: data.notes,
          selectedDate: data.selectedDate,
          selectedTime: data.selectedTime,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const result = await response.json()

      if (result.clientSecret) {
        // Initialize Stripe and redirect to payment
        const stripe = await loadStripe(result.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: result.clientSecret
          })
          
          if (error) {
            setError(error.message || 'Payment processing failed')
          }
        }
      } else {
        setSuccess(true)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const canProceedToNext = () => {
    switch (step) {
      case 'datetime': return watchedDate && watchedTime
      case 'details': return isValid
      case 'payment': return true
      default: return false
    }
  }

  const nextStep = () => {
    const steps: Array<'datetime' | 'details' | 'payment'> = ['datetime', 'details', 'payment']
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: Array<'datetime' | 'details' | 'payment'> = ['datetime', 'details', 'payment']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your appointment has been successfully booked. You&apos;ll receive a confirmation email shortly.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['datetime', 'details', 'payment'].map((stepName, index) => {
          const stepLabels = {
            datetime: 'Date & Time',
            details: 'Your Details',
            payment: 'Payment'
          }
          
          const isCompleted = ['datetime', 'details', 'payment'].indexOf(step) > index
          const isCurrent = step === stepName
          
          return (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted ? 'bg-green-500 text-white' : 
                isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isCurrent ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {stepLabels[stepName as keyof typeof stepLabels]}
              </span>
              {index < 2 && (
                <div className={`mx-4 h-px w-12 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Date & Time Selection */}
        {step === 'datetime' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Choose Date & Time
              </CardTitle>
              <CardDescription>Select your preferred appointment time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="selectedDate">Date</Label>
                <Input
                  id="selectedDate"
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  {...register('selectedDate', { required: 'Please select a date' })}
                  className="mt-1"
                />
                {errors.selectedDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.selectedDate.message}</p>
                )}
              </div>

              {watchedDate && timeSlots.length > 0 && (
                <div>
                  <Label>Available Times</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {timeSlots.map(slot => (
                      <Label
                        key={slot.id}
                        className={`flex items-center justify-center p-3 border rounded cursor-pointer transition-colors ${
                          watchedTime === slot.startTime
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={slot.startTime}
                          {...register('selectedTime', { required: 'Please select a time' })}
                          className="sr-only"
                        />
                        <Clock className="w-4 h-4 mr-2" />
                        {slot.displayTime}
                      </Label>
                    ))}
                  </div>
                  {errors.selectedTime && (
                    <p className="text-sm text-red-600 mt-1">{errors.selectedTime.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Details Form */}
        {step === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Your Details
              </CardTitle>
              <CardDescription>Please provide your contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientName">Full Name</Label>
                <Input
                  id="clientName"
                  {...register('clientName', { required: 'Name is required' })}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
                {errors.clientName && (
                  <p className="text-sm text-red-600 mt-1">{errors.clientName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="clientEmail">Email Address</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  {...register('clientEmail', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  placeholder="Enter your email address"
                  className="mt-1"
                />
                {errors.clientEmail && (
                  <p className="text-sm text-red-600 mt-1">{errors.clientEmail.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="clientPhone">Phone Number</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  {...register('clientPhone')}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Any specific requirements or notes..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Payment</CardTitle>
              <CardDescription>Review your booking details and complete payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{service.name}</span>
                  <span className="font-bold">${service.price}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Date: {watchedDate && format(new Date(watchedDate), 'EEEE, MMMM d, yyyy')}</p>
                  <p>Time: {timeSlots.find(slot => slot.startTime === watchedTime)?.displayTime}</p>
                  <p>Duration: {service.duration} minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 'datetime'}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {step !== 'payment' ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceedToNext()}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !canProceedToNext()}
              >
                {loading ? 'Processing...' : `Pay $${service.price}`}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}