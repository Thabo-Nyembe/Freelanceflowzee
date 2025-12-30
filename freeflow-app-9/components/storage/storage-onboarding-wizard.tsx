'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Cloud,
  HardDrive,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  CloudCog,
  FolderSync,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StorageOnboardingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

type Step = 1 | 2 | 3 | 4

interface ProviderInfo {
  id: 'google-drive' | 'dropbox' | 'onedrive' | 'box' | 'icloud'
  name: string
  icon: string
  color: string
  bgColor: string
  description: string
}

const providers: ProviderInfo[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '📁',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    description: 'Access your Google Drive files'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    color: 'text-blue-700',
    bgColor: 'bg-blue-600',
    description: 'Sync with your Dropbox'
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: '☁️',
    color: 'text-blue-800',
    bgColor: 'bg-blue-700',
    description: 'Connect to Microsoft OneDrive'
  },
  {
    id: 'box',
    name: 'Box',
    icon: '📫',
    color: 'text-blue-900',
    bgColor: 'bg-blue-800',
    description: 'Integrate with Box storage'
  },
  {
    id: 'icloud',
    name: 'iCloud Drive',
    icon: '☁️',
    color: 'text-gray-700',
    bgColor: 'bg-gray-600',
    description: 'Access your iCloud files'
  }
]

export function StorageOnboardingWizard({
  open,
  onOpenChange,
  onComplete
}: StorageOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo | null>(null)
  const [connecting, setConnecting] = useState(false)

  const progress = (currentStep / 4) * 100

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleConnect = async (provider: ProviderInfo) => {
    setSelectedProvider(provider)
    setConnecting(true)

    const redirectUrl = `${window.location.origin}/api/storage/callback`
    const state = btoa(JSON.stringify({
      provider: provider.id,
      returnTo: window.location.pathname,
      onboarding: true
    }))

    let authUrl = ''

    switch (provider.id) {
      case 'google-drive':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent('https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')}&` +
          `state=${state}&` +
          `access_type=offline&` +
          `prompt=consent`
        break

      case 'dropbox':
        authUrl = `https://www.dropbox.com/oauth2/authorize?` +
          `client_id=${process.env.NEXT_PUBLIC_DROPBOX_APP_KEY}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `response_type=code&` +
          `state=${state}&` +
          `token_access_type=offline`
        break

      case 'onedrive':
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
          `client_id=${process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent('Files.Read.All User.Read offline_access')}&` +
          `state=${state}&` +
          `prompt=consent`
        break

      case 'box':
      case 'icloud':
        alert(`${provider.name} integration coming soon!`)
        setConnecting(false)
        return
    }

    // Redirect to OAuth flow
    window.location.href = authUrl
  }

  const handleSkip = () => {
    onComplete()
    onOpenChange(false)
  }

  const handleFinish = () => {
    onComplete()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Cloud Storage Setup
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            Connect your cloud storage accounts in just a few steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of 4</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="py-6">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 blur-2xl opacity-30 animate-pulse" />
                  <Cloud className="relative w-24 h-24 text-blue-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Welcome to Unified Cloud Storage!</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Manage all your files from Google Drive, Dropbox, OneDrive, and more in one beautiful interface.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                <Card className="p-6 text-center space-y-3 border-2 hover:border-blue-500 transition-colors">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FolderSync className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold">Unified Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Access all your files from multiple providers in one place
                  </p>
                </Card>

                <Card className="p-6 text-center space-y-3 border-2 hover:border-green-500 transition-colors">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold">Secure OAuth</h4>
                  <p className="text-sm text-muted-foreground">
                    Bank-level security with OAuth 2.0 authentication
                  </p>
                </Card>

                <Card className="p-6 text-center space-y-3 border-2 hover:border-purple-500 transition-colors">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold">Lightning Fast</h4>
                  <p className="text-sm text-muted-foreground">
                    Search and browse files across all providers instantly
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Benefits */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold">Why Connect Your Storage?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Get the most out of your cloud storage with these powerful features
                </p>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                <Card className="p-6 border-l-4 border-l-blue-500">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Cloud className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Unified File Browser</h4>
                      <p className="text-sm text-muted-foreground">
                        Browse files from all your cloud storage providers in one unified interface. No more switching between apps!
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-green-500">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <HardDrive className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Total Storage Overview</h4>
                      <p className="text-sm text-muted-foreground">
                        See your total storage quota across all providers at a glance. Monitor usage and available space effortlessly.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-purple-500">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Smart Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Search for files across all connected providers simultaneously. Find what you need in seconds.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-orange-500">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Privacy First</h4>
                      <p className="text-sm text-muted-foreground">
                        Your files stay on your cloud providers. We only access metadata through secure OAuth connections.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Choose Provider */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold">Choose Your First Provider</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Select a cloud storage provider to connect. You can add more providers later.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {providers.map((provider) => (
                  <Card
                    key={provider.id}
                    className={cn(
                      'p-6 cursor-pointer transition-all hover:shadow-lg border-2',
                      selectedProvider?.id === provider.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-200 hover:border-blue-300'
                    )}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
                        provider.bgColor
                      )}>
                        {provider.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{provider.name}</h4>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                      {selectedProvider?.id === provider.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {selectedProvider && (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={() => handleConnect(selectedProvider)}
                    disabled={connecting}
                    className="gap-2"
                  >
                    {connecting ? (
                      <>
                        <CloudCog className="w-5 h-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <CloudCog className="w-5 h-5" />
                        Connect {selectedProvider.name}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur-2xl opacity-30 animate-pulse" />
                  <CheckCircle2 className="relative w-24 h-24 text-green-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold">All Set! 🎉</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Your cloud storage is now connected. You can browse all your files in the Files Hub.
                </p>
              </div>

              <Card className="p-6 max-w-2xl mx-auto text-left">
                <h4 className="font-semibold mb-4">What's Next?</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Browse Your Files</p>
                      <p className="text-sm text-muted-foreground">
                        Head to the "All Files" tab to see all your cloud files
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Add More Providers</p>
                      <p className="text-sm text-muted-foreground">
                        Connect additional cloud storage accounts anytime
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Search Across All Files</p>
                      <p className="text-sm text-muted-foreground">
                        Use the search bar to find files across all providers instantly
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Button
                size="lg"
                onClick={handleFinish}
                className="gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 4 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip for now
            </Button>

            {currentStep !== 3 && (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === 3 && !selectedProvider && (
              <Button onClick={handleNext} variant="outline" className="gap-2">
                Skip this step
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
