'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { format, addDays, startOfDay } from 'date-fns'
)

  // Generate simple time slots
  useEffect(() => {
    if (watchedDate) {
      const slots: TimeSlot[] = []
      
      // Generate slots from 9 AM to 6 PM, 30-minute intervals
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}
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
    const steps: Array<&apos;datetime&apos; | &apos;details&apos; | &apos;payment&apos;> = ['datetime&apos;, 'details', &apos;payment']
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: Array<&apos;datetime&apos; | &apos;details&apos; | &apos;payment&apos;> = ['datetime&apos;, 'details', &apos;payment']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  if (success) {
    return (
      <Card className= "max-w-2xl mx-auto">
        <CardContent className= "pt-6 text-center">
          <CheckCircle className= "w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className= "text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className= "text-gray-600 mb-4">
            Your appointment has been successfully booked. You'll receive a confirmation email shortly.
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
      <div className= "flex items-center justify-between mb-8">
        {['datetime', 'details', 'payment'].map((stepName, index) => {
          const stepLabels = {
            datetime: 'Date & Time',
            details: 'Your Details',
            payment: 'Payment'
          }
          
          const isCompleted = ['datetime', 'details', 'payment'].indexOf(step) > index
          const isCurrent = step === stepName
          
          return (
            <div key={stepName} className= "flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted ? 'bg-green-500 text-white' : 
                isCurrent ? 'bg-blue-500 text-white' : "bg-gray-200 text-gray-600
              }`}>"
                {isCompleted ? <Check className= "w-4 h-4" /> : index + 1}
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
        <Card className= "border-red-200 bg-red-50">
          <CardContent className= "pt-6">
            <div className= "flex items-center gap-2 text-red-700">
              <AlertCircle className= "w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className= "space-y-6">
        {/* Date & Time Selection */}
        {step === 'datetime' && (
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <CalendarDays className= "w-5 h-5" />
                Choose Date & Time
              </CardTitle>
              <CardDescription>Select your preferred appointment time</CardDescription>
            </CardHeader>
            <CardContent className= "space-y-6">
              <div>
                <Label htmlFor= "selectedDate">Date</Label>
                <Input
                  id= "selectedDate
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  {...register('selectedDate', { required: 'Please select a date' })}
                  className="mt-1
                />
                {errors.selectedDate && ("
                  <p className= "text-sm text-red-600 mt-1">{errors.selectedDate.message}</p>
                )}
              </div>

              {watchedDate && (
                <div>
                  <Label>Available Times</Label>
                  <div className= "grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setValue('selectedTime', slot.startTime)}
                        className={`p-2 text-sm border rounded-md transition-colors ${
                          watchedTime === slot.startTime
                            ? 'bg-blue-500 text-white border-blue-500
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {slot.displayTime}
                      </button>
                    ))}
                  </div>
                  {errors.selectedTime && (
                    <p className= "text-sm text-red-600 mt-1">{errors.selectedTime.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Client Details */}
        {step === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <User className= "w-5 h-5" />
                Your Information
              </CardTitle>
              <CardDescription>We&apos;ll use this information to confirm your appointment</CardDescription>
            </CardHeader>
            <CardContent className= "space-y-4">
              <div className= "grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor= "clientName">Full Name *</Label>
                  <Input
                    id= "clientName
                    {...register('clientName', { required: 'Name is required' })}
                    className="mt-1
                  />
                  {errors.clientName && ("
                    <p className= "text-sm text-red-600 mt-1">{errors.clientName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor= "clientPhone">Phone Number</Label>
                  <Input
                    id= "clientPhone
                    type="tel"
                    {...register('clientPhone')}
                    className="mt-1
                  />
                </div>
              </div>

              <div>"
                <Label htmlFor= "clientEmail">Email Address *</Label>
                <Input
                  id= "clientEmail
                  type="email"
                  {...register('clientEmail', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="mt-1
                />
                {errors.clientEmail && ("
                  <p className= "text-sm text-red-600 mt-1">{errors.clientEmail.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor= "notes">Additional Notes (Optional)</Label>
                <Textarea
                  id= "notes
                  {...register('notes')}
                  placeholder="Any specific requirements or questions..."
                  className="mt-1
                />
              </div>
"
              <div className= "flex items-center space-x-2">
                <Checkbox
                  id= "agreeToTerms
                  {...register('agreeToTerms', { required: 'You must agree to the terms' })}
                />
                <Label htmlFor= "agreeToTerms" className= "text-sm">
                  I agree to the terms and conditions and privacy policy
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className= "text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        {step === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <CreditCard className= "w-5 h-5" />
                Booking Summary
              </CardTitle>
              <CardDescription>Review your booking details and complete payment</CardDescription>
            </CardHeader>
            <CardContent className= "space-y-4">
              <div className= "bg-gray-50 p-4 rounded-lg space-y-3">
                <div className= "flex justify-between items-start">
                  <div>
                    <h3 className= "font-medium">{service.title}</h3>
                    <p className= "text-sm text-gray-600">{service.description}</p>
                    <div className= "flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className= "flex items-center gap-1">
                        <Clock className= "w-4 h-4" />
                        {service.duration} minutes
                      </span>
                      <Badge variant= "secondary">{service.category}</Badge>
                    </div>
                  </div>
                  <div className= "text-right">
                    <div className= "text-2xl font-bold">{service.formattedPrice}</div>
                  </div>
                </div>

                {watchedDate && watchedTime && (
                  <div className= "border-t pt-3">
                    <div className= "flex justify-between">
                      <span className= "text-sm text-gray-600">Date & Time:</span>
                      <span className= "text-sm font-medium">
                        {format(new Date(watchedDate), 'EEEE, MMMM d, yyyy')} at{' '}
                        {timeSlots.find(slot => slot.startTime === watchedTime)?.displayTime}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className= "text-center">
                <Button
                  type="submit"
                  size= "lg
                  className="w-full
                  disabled={loading}
                >"
                  {loading ? 'Processing...' : `Pay ${service.formattedPrice} & Book Appointment`}
                </Button>
                <p className= "text-xs text-gray-500 mt-2">
                  Secure payment powered by Stripe. You'll receive a confirmation email after payment.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className= "flex justify-between">
          <Button
            type="button"
            variant="outline
            onClick={prevStep}"
            disabled={step === 'datetime'}
          >
            Previous
          </Button>
          
          {step !== 'payment' && (
            <Button
              type="button
              onClick={nextStep}
              disabled={!canProceedToNext()}
            >
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}"