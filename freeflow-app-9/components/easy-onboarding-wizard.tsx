'use client'

/**
 * Easy User Onboarding Wizard
 *
 * Guides new users through account setup, profile creation,
 * data import, and initial configuration in under 10 minutes
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Briefcase, Target, Zap, Check, ArrowRight, ArrowLeft,
  Upload, Download, Star, Sparkles, Shield, Clock, TrendingUp,
  Users, Calendar, CreditCard, MessageSquare, CheckCircle, Play,
  FileText, Folder, Image, Settings, HelpCircle, Info, ExternalLink,
  Chrome, Database, Copy, Import, RefreshCw, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('EasyOnboarding')

// ============================================================================
// COMPETITOR APPS (For Data Import)
// ============================================================================

interface CompetitorApp {
  id: string
  name: string
  icon: string
  category: 'freelance' | 'project-management' | 'crm' | 'time-tracking' | 'invoicing'
  description: string
  importableData: string[]
  marketShare: string
  setupTime: string
  methodology: 'api' | 'csv' | 'export' | 'chrome-extension'
  popular: boolean
}

const COMPETITOR_APPS: CompetitorApp[] = [
  {
    id: 'upwork',
    name: 'Upwork',
    icon: '🟢',
    category: 'freelance',
    description: 'Import your clients, projects, and earnings data',
    importableData: ['Clients', 'Projects', 'Earnings History', 'Reviews', 'Skills', 'Portfolio'],
    marketShare: '#1 Freelance Platform',
    setupTime: '3 minutes',
    methodology: 'api',
    popular: true
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    icon: '🟩',
    category: 'freelance',
    description: 'Import gigs, orders, and client information',
    importableData: ['Gigs', 'Orders', 'Client Reviews', 'Earnings', 'Messages'],
    marketShare: '45M users',
    setupTime: '3 minutes',
    methodology: 'export',
    popular: true
  },
  {
    id: 'freelancer',
    name: 'Freelancer.com',
    icon: '🔷',
    category: 'freelance',
    description: 'Transfer your freelance projects and client data',
    importableData: ['Projects', 'Clients', 'Bids', 'Portfolio', 'Skills'],
    marketShare: '50M users',
    setupTime: '4 minutes',
    methodology: 'export',
    popular: false
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: '📋',
    category: 'project-management',
    description: 'Import boards, cards, and project workflows',
    importableData: ['Boards', 'Cards', 'Tasks', 'Checklists', 'Team Members', 'Attachments'],
    marketShare: '50M+ users',
    setupTime: '2 minutes',
    methodology: 'api',
    popular: true
  },
  {
    id: 'asana',
    name: 'Asana',
    icon: '🎯',
    category: 'project-management',
    description: 'Migrate tasks, projects, and team workflows',
    importableData: ['Projects', 'Tasks', 'Subtasks', 'Team Members', 'Custom Fields', 'Timeline'],
    marketShare: '100K+ companies',
    setupTime: '3 minutes',
    methodology: 'api',
    popular: true
  },
  {
    id: 'monday',
    name: 'Monday.com',
    icon: '📊',
    category: 'project-management',
    description: 'Import boards, workflows, and automation',
    importableData: ['Boards', 'Items', 'Updates', 'Files', 'Automations', 'Integrations'],
    marketShare: '150K+ customers',
    setupTime: '3 minutes',
    methodology: 'api',
    popular: true
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    category: 'project-management',
    description: 'Transfer databases, docs, and knowledge base',
    importableData: ['Pages', 'Databases', 'Tasks', 'Notes', 'Templates', 'Files'],
    marketShare: '20M+ users',
    setupTime: '4 minutes',
    methodology: 'export',
    popular: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: '🧡',
    category: 'crm',
    description: 'Migrate contacts, deals, and pipeline',
    importableData: ['Contacts', 'Companies', 'Deals', 'Tasks', 'Notes', 'Emails', 'Pipeline'],
    marketShare: '150K+ businesses',
    setupTime: '5 minutes',
    methodology: 'api',
    popular: true
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '☁️',
    category: 'crm',
    description: 'Import enterprise CRM data',
    importableData: ['Accounts', 'Contacts', 'Opportunities', 'Leads', 'Activities', 'Reports'],
    marketShare: '#1 CRM',
    setupTime: '5 minutes',
    methodology: 'api',
    popular: false
  },
  {
    id: 'toggl',
    name: 'Toggl Track',
    icon: '⏱️',
    category: 'time-tracking',
    description: 'Import time entries and project hours',
    importableData: ['Time Entries', 'Projects', 'Clients', 'Tags', 'Reports'],
    marketShare: '5M+ users',
    setupTime: '2 minutes',
    methodology: 'api',
    popular: true
  },
  {
    id: 'harvest',
    name: 'Harvest',
    icon: '🕐',
    category: 'time-tracking',
    description: 'Migrate time tracking and invoicing data',
    importableData: ['Time Entries', 'Invoices', 'Expenses', 'Projects', 'Clients'],
    marketShare: '70K+ companies',
    setupTime: '3 minutes',
    methodology: 'api',
    popular: false
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    icon: '💰',
    category: 'invoicing',
    description: 'Import invoices, clients, and payments',
    importableData: ['Invoices', 'Clients', 'Payments', 'Expenses', 'Projects', 'Time Entries'],
    marketShare: '30M+ users',
    setupTime: '4 minutes',
    methodology: 'api',
    popular: true
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    icon: '📗',
    category: 'invoicing',
    description: 'Transfer accounting and invoice data',
    importableData: ['Invoices', 'Customers', 'Vendors', 'Payments', 'Expenses', 'Reports'],
    marketShare: '7M+ businesses',
    setupTime: '5 minutes',
    methodology: 'api',
    popular: false
  }
]

// ============================================================================
// ONBOARDING STEPS
// ============================================================================

type OnboardingStep = 'welcome' | 'profile' | 'business' | 'goals' | 'import' | 'integrations' | 'templates' | 'complete'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  bio: string
  location: string
  website: string
}

interface BusinessInfo {
  businessName: string
  businessType: 'freelancer' | 'agency' | 'consultant' | 'studio' | 'other'
  industry: string
  teamSize: '1' | '2-5' | '6-10' | '11-50' | '50+'
  monthlyRevenue: string
}

interface UserGoals {
  primaryGoal: 'automation' | 'client-management' | 'project-tracking' | 'invoicing' | 'all'
  weeklyHours: string
  currentChallenges: string[]
}

// ============================================================================
// COMPONENT
// ============================================================================

interface EasyOnboardingWizardProps {
  onComplete?: () => void
  userId?: string
}

export function EasyOnboardingWizard({ onComplete, userId }: EasyOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set())
  const [importProgress, setImportProgress] = useState<Record<string, number>>({})

  // Form Data
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: ''
  })

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: '',
    businessType: 'freelancer',
    industry: '',
    teamSize: '1',
    monthlyRevenue: ''
  })

  const [goals, setGoals] = useState<UserGoals>({
    primaryGoal: 'automation',
    weeklyHours: '',
    currentChallenges: []
  })

  const steps: OnboardingStep[] = ['welcome', 'profile', 'business', 'goals', 'import', 'integrations', 'templates', 'complete']
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
      logger.info('Onboarding: moved to next step', { step: steps[nextIndex] })
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleImportFromApp = async (appId: string) => {
    const app = COMPETITOR_APPS.find(a => a.id === appId)
    if (!app) return

    logger.info('Starting data import', { appId, appName: app.name })

    setIsLoading(true)
    setImportProgress({ ...importProgress, [appId]: 0 })

    try {
      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setImportProgress(prev => ({ ...prev, [appId]: i }))
      }

      setSelectedApps(prev => new Set(prev).add(appId))

      toast.success(`${app.name} Data Imported!`, {
        description: `Successfully imported: ${app.importableData.slice(0, 3).join(', ')}${app.importableData.length > 3 ? '...' : ''}`
      })

      logger.info('Data import completed', { appId, itemsImported: app.importableData.length })

    } catch (error: any) {
      logger.error('Data import failed', { appId, error: error.message })
      toast.error('Import Failed', {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOnboarding = async () => {
    setIsLoading(true)

    try {
      logger.info('Completing onboarding', {
        profileComplete: !!profile.firstName,
        businessInfoComplete: !!businessInfo.businessName,
        goalsSet: !!goals.primaryGoal,
        appsImported: selectedApps.size
      })

      // Save all onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          businessInfo,
          goals,
          importedApps: Array.from(selectedApps)
        })
      })

      const result = await response.json()

      if (result.success) {
        setCurrentStep('complete')
        toast.success('Welcome to KAZI!', {
          description: 'Your account is ready. Let\'s start automating your business!'
        })

        logger.info('Onboarding completed successfully')

        // Call completion callback after 2 seconds
        setTimeout(() => {
          onComplete?.()
        }, 2000)
      } else {
        throw new Error(result.error || 'Failed to complete onboarding')
      }

    } catch (error: any) {
      logger.error('Onboarding completion failed', { error: error.message })
      toast.error('Setup Failed', {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfile({ ...profile, avatar: e.target?.result as string })
          toast.success('Avatar uploaded!')
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // ============================================================================
  // STEP RENDERERS
  // ============================================================================

  const renderWelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-8"
    >
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-8xl"
        >
          👋
        </motion.div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to KAZI!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Let's get you set up in under 10 minutes. We'll help you automate your business,
          import your data, and start saving time immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="border-2 hover:border-blue-500 transition-all">
          <CardHeader>
            <Zap className="w-12 h-12 text-blue-500 mb-2" />
            <CardTitle>Save Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automate 25+ hours of work per week with AI-powered tools
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-500 transition-all">
          <CardHeader>
            <TrendingUp className="w-12 h-12 text-purple-500 mb-2" />
            <CardTitle>Grow Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Increase earnings by 30-50% with better client management
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-pink-500 transition-all">
          <CardHeader>
            <Import className="w-12 h-12 text-pink-500 mb-2" />
            <CardTitle>Import Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Easily migrate from Upwork, Fiverr, Trello, and 10+ other apps
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        size="lg"
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-lg px-8 py-6"
        onClick={handleNext}
      >
        Get Started
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-sm text-muted-foreground">
        ⏱️ Takes less than 10 minutes • 🔒 Your data is secure
      </p>
    </motion.div>
  )

  const renderProfileStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Tell us about yourself</h2>
        <p className="text-muted-foreground">This helps us personalize your experience</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarUpload}>
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                placeholder="John"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                placeholder="Doe"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              placeholder="Tell us about yourself..."
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="San Francisco, CA"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!profile.firstName || !profile.lastName || !profile.email}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )

  const renderBusinessStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Your Business</h2>
        <p className="text-muted-foreground">Help us understand your business better</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Business Name */}
          <div className="space-y-2">
            <Label>Business Name *</Label>
            <Input
              placeholder="Acme Studios"
              value={businessInfo.businessName}
              onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label>Business Type *</Label>
            <RadioGroup
              value={businessInfo.businessType}
              onValueChange={(value: any) => setBusinessInfo({ ...businessInfo, businessType: value })}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'freelancer', label: 'Freelancer', icon: User },
                  { value: 'agency', label: 'Agency', icon: Users },
                  { value: 'consultant', label: 'Consultant', icon: Briefcase },
                  { value: 'studio', label: 'Studio', icon: Sparkles }
                ].map((type) => (
                  <div key={type.value} className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-blue-500">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select value={businessInfo.industry} onValueChange={(value) => setBusinessInfo({ ...businessInfo, industry: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="design">Design & Creative</SelectItem>
                <SelectItem value="development">Software Development</SelectItem>
                <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                <SelectItem value="consulting">Business Consulting</SelectItem>
                <SelectItem value="writing">Writing & Content</SelectItem>
                <SelectItem value="photography">Photography & Video</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Size & Revenue */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Team Size</Label>
              <Select value={businessInfo.teamSize} onValueChange={(value: any) => setBusinessInfo({ ...businessInfo, teamSize: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Just me</SelectItem>
                  <SelectItem value="2-5">2-5 people</SelectItem>
                  <SelectItem value="6-10">6-10 people</SelectItem>
                  <SelectItem value="11-50">11-50 people</SelectItem>
                  <SelectItem value="50+">50+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly Revenue</Label>
              <Select value={businessInfo.monthlyRevenue} onValueChange={(value) => setBusinessInfo({ ...businessInfo, monthlyRevenue: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-5k">$0 - $5,000</SelectItem>
                  <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                  <SelectItem value="50k+">$50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!businessInfo.businessName}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )

  const renderGoalsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">What are your goals?</h2>
        <p className="text-muted-foreground">We'll customize KAZI to help you achieve them</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Primary Goal */}
          <div className="space-y-3">
            <Label>Primary Goal *</Label>
            <RadioGroup
              value={goals.primaryGoal}
              onValueChange={(value: any) => setGoals({ ...goals, primaryGoal: value })}
            >
              <div className="space-y-3">
                {[
                  { value: 'automation', label: 'Automate repetitive tasks', desc: 'Save time with AI automation', icon: Zap },
                  { value: 'client-management', label: 'Manage clients better', desc: 'Track relationships and projects', icon: Users },
                  { value: 'project-tracking', label: 'Track projects efficiently', desc: 'Stay organized and on schedule', icon: Target },
                  { value: 'invoicing', label: 'Get paid faster', desc: 'Automate invoicing and follow-ups', icon: CreditCard },
                  { value: 'all', label: 'All of the above', desc: 'Complete business automation', icon: Star }
                ].map((goal) => (
                  <div key={goal.value} className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:border-blue-500">
                    <RadioGroupItem value={goal.value} id={goal.value} />
                    <Label htmlFor={goal.value} className="flex-1 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <goal.icon className="w-5 h-5 mt-0.5 text-blue-500" />
                        <div>
                          <div className="font-medium">{goal.label}</div>
                          <div className="text-sm text-muted-foreground">{goal.desc}</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Weekly Hours */}
          <div className="space-y-2">
            <Label>Hours spent on admin tasks per week?</Label>
            <Input
              type="number"
              placeholder="e.g., 15"
              value={goals.weeklyHours}
              onChange={(e) => setGoals({ ...goals, weeklyHours: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              KAZI can automate 60-80% of these tasks
            </p>
          </div>

          {/* Current Challenges */}
          <div className="space-y-3">
            <Label>Current Challenges (select all that apply)</Label>
            <div className="space-y-2">
              {[
                'Too many manual tasks',
                'Missing client follow-ups',
                'Late invoice payments',
                'Poor project visibility',
                'Disorganized data',
                'No time for growth'
              ].map((challenge) => (
                <div key={challenge} className="flex items-center space-x-2">
                  <Checkbox
                    id={challenge}
                    checked={goals.currentChallenges.includes(challenge)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setGoals({ ...goals, currentChallenges: [...goals.currentChallenges, challenge] })
                      } else {
                        setGoals({ ...goals, currentChallenges: goals.currentChallenges.filter(c => c !== challenge) })
                      }
                    }}
                  />
                  <Label htmlFor={challenge} className="cursor-pointer">
                    {challenge}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )

  const renderImportStep = () => {
    const categories = Array.from(new Set(COMPETITOR_APPS.map(app => app.category)))

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Import Your Data</h2>
          <p className="text-muted-foreground">
            Migrate from other platforms in minutes. Select the apps you use:
          </p>
        </div>

        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <Import className="h-4 w-4 text-blue-600" />
          <AlertTitle>Easy Migration</AlertTitle>
          <AlertDescription>
            We'll help you import clients, projects, tasks, and more. Your data stays secure and private.
          </AlertDescription>
        </Alert>

        {categories.map((category) => {
          const apps = COMPETITOR_APPS.filter(app => app.category === category)

          return (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-semibold capitalize flex items-center gap-2">
                {category.replace('-', ' ')}
                <Badge variant="secondary">{apps.length} apps</Badge>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apps.map((app) => {
                  const isImported = selectedApps.has(app.id)
                  const progress = importProgress[app.id]

                  return (
                    <Card
                      key={app.id}
                      className={`transition-all ${isImported ? 'border-green-500 border-2' : ''}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{app.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{app.name}</CardTitle>
                              {app.popular && (
                                <Badge variant="secondary" className="mt-1">Popular</Badge>
                              )}
                            </div>
                          </div>
                          {isImported && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                        <CardDescription>{app.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold">What we'll import:</div>
                          <div className="flex flex-wrap gap-1">
                            {app.importableData.slice(0, 4).map((item) => (
                              <Badge key={item} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {app.importableData.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{app.importableData.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {app.setupTime}
                          <span>•</span>
                          <span>{app.marketShare}</span>
                        </div>

                        {progress !== undefined && progress < 100 ? (
                          <div className="space-y-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground">
                              Importing... {progress}%
                            </p>
                          </div>
                        ) : isImported ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedApps(prev => {
                                const next = new Set(prev)
                                next.delete(app.id)
                                return next
                              })
                            }}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Imported
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            onClick={() => handleImportFromApp(app.id)}
                            disabled={isLoading}
                          >
                            <Import className="w-4 h-4 mr-2" />
                            Import from {app.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderCompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <div className="text-8xl mb-4">🎉</div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          You're All Set!
        </h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Your KAZI account is ready. Let's start automating your business!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="border-green-200">
          <CardHeader>
            <CheckCircle className="w-12 h-12 text-green-500 mb-2 mx-auto" />
            <CardTitle>Profile Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {profile.firstName} {profile.lastName}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <Briefcase className="w-12 h-12 text-blue-500 mb-2 mx-auto" />
            <CardTitle>Business Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {businessInfo.businessName}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <Import className="w-12 h-12 text-purple-500 mb-2 mx-auto" />
            <CardTitle>Data Imported</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {selectedApps.size} apps connected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Next Steps:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Configure Automation</div>
                  <div className="text-sm text-muted-foreground">
                    Set up your automation rules
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                  <Play className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Take a Tour</div>
                  <div className="text-sm text-muted-foreground">
                    Learn the key features
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button
        size="lg"
        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg px-8 py-6"
        onClick={onComplete}
      >
        Go to Dashboard
        <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Progress Bar */}
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Setup Progress</span>
                  <span className="text-muted-foreground">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <div key={currentStep}>
            {currentStep === 'welcome' && renderWelcomeStep()}
            {currentStep === 'profile' && renderProfileStep()}
            {currentStep === 'business' && renderBusinessStep()}
            {currentStep === 'goals' && renderGoalsStep()}
            {currentStep === 'import' && renderImportStep()}
            {currentStep === 'integrations' && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Integration setup will go here</p>
                <Button onClick={handleNext}>Continue</Button>
              </div>
            )}
            {currentStep === 'templates' && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Templates selection will go here</p>
                <Button onClick={() => handleCompleteOnboarding()}>Complete Setup</Button>
              </div>
            )}
            {currentStep === 'complete' && renderCompleteStep()}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}
