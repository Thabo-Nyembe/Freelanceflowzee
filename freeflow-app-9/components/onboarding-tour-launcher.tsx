'use client'

/**
 * Onboarding Tour Launcher
 *
 * Provides UI for users to start interactive tours anytime
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sparkles, Play, CheckCircle, Clock, Users, Target, Video, DollarSign, Zap, TrendingUp, Upload } from 'lucide-react'
import { useOnboarding } from '@/components/onboarding/onboarding-provider'
import { onboardingTours, getToursByRole } from '@/lib/onboarding-tours'

interface TourCardProps {
  tourId: string
  title: string
  description: string
  stepCount: number
  estimatedTime: string
  icon: React.ReactNode
  isCompleted: boolean
  onStart: () => void
}

function TourCard({ tourId, title, description, stepCount, estimatedTime, icon, isCompleted, onStart }: TourCardProps) {
  return (
    <Card className={`transition-all hover:shadow-lg ${isCompleted ? 'border-green-300 bg-green-50/50' : 'hover:border-blue-300'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {stepCount} steps
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {estimatedTime}
                </Badge>
              </div>
            </div>
          </div>
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className={`w-full ${isCompleted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'}`}
          onClick={onStart}
        >
          <Play className="w-4 h-4 mr-2" />
          {isCompleted ? 'Restart Tour' : 'Start Tour'}
        </Button>
      </CardContent>
    </Card>
  )
}

export function OnboardingTourLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const { startTour, completedTours } = useOnboarding()

  const handleStartTour = (tourId: string) => {
    const tour = onboardingTours[tourId]
    if (tour) {
      startTour(tour)
      setIsOpen(false)
    }
  }

  const tourConfigs = [
    {
      id: 'quickStart',
      icon: <Sparkles className="w-6 h-6 text-blue-500" />,
      estimatedTime: '5 min'
    },
    {
      id: 'escrowGuide',
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      estimatedTime: '4 min'
    },
    {
      id: 'videoStudioTour',
      icon: <Video className="w-6 h-6 text-purple-500" />,
      estimatedTime: '6 min'
    },
    {
      id: 'projectManagement',
      icon: <Target className="w-6 h-6 text-indigo-500" />,
      estimatedTime: '7 min'
    },
    {
      id: 'financialMastery',
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      estimatedTime: '8 min'
    },
    {
      id: 'aiFeatures',
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      estimatedTime: '6 min'
    },
    {
      id: 'guestUploadFeature',
      icon: <Upload className="w-6 h-6 text-pink-500" />,
      estimatedTime: '4 min'
    }
  ]

  const completionRate = (completedTours.length / tourConfigs.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Sparkles className="w-4 h-4 mr-2" />
          Take a Tour
          {completedTours.length > 0 && (
            <Badge className="ml-2 bg-green-500">
              {completedTours.length}/{tourConfigs.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            Interactive Tours
          </DialogTitle>
          <DialogDescription>
            Master KAZI with step-by-step guided tours. Learn features, best practices, and unlock your full potential!
          </DialogDescription>
        </DialogHeader>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">Your Progress</span>
              <span className="text-2xl font-bold text-blue-600">{Math.round(completionRate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {completedTours.length} of {tourConfigs.length} tours completed
              {completedTours.length === tourConfigs.length && ' 🎉'}
            </p>
          </CardContent>
        </Card>

        {/* Tour Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {tourConfigs.map((config) => {
            const tour = onboardingTours[config.id]
            if (!tour) return null

            return (
              <TourCard
                key={config.id}
                tourId={config.id}
                title={tour.title}
                description={tour.description}
                stepCount={tour.steps.length}
                estimatedTime={config.estimatedTime}
                icon={config.icon}
                isCompleted={completedTours.includes(tour.id)}
                onStart={() => handleStartTour(config.id)}
              />
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Pro Tip</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Complete all tours to earn badges, unlock advanced features, and become a KAZI expert! You can restart any tour at any time.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
