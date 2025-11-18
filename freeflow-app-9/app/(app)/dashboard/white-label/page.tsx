'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'
import {
  Palette, Brush, Type, Image, Layout, Settings, Eye, Code,
  Download, Upload, Share2, Copy, Save, RefreshCw, Zap,
  Monitor, Smartphone, Tablet, Globe, Users, Crown, Star,
  Shield, Lock, Unlock, CheckCircle, AlertCircle, Info,
  Package, Layers, Grid3x3, MousePointer, Hand, Move,
  RotateCcw, Scale, Trash2, Plus, Minus, Edit, Search,
  Filter, MoreVertical, ArrowRight, ExternalLink, Target,
  Paintbrush, Pipette, Scissors, Wand2, Sparkles
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'

interface BrandConfig {
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  borderRadius: number
  customDomain: string
  features: string[]
}

interface Template {
  id: string
  name: string
  category: string
  preview: string
  description: string
  features: string[]
  industry: string
  complexity: 'basic' | 'advanced' | 'enterprise'
}

interface Component {
  id: string
  name: string
  type: 'header' | 'footer' | 'sidebar' | 'content' | 'widget'
  customizable: boolean
  required: boolean
  description: string
}

const TEMPLATES: Template[] = [
  {
    id: 'saas-platform',
    name: 'SaaS Platform',
    category: 'Software',
    preview: '/api/placeholder/400/300',
    description: 'Complete SaaS platform with user management, billing, and analytics',
    features: ['User Dashboard', 'Subscription Management', 'Analytics', 'API Integration'],
    industry: 'Technology',
    complexity: 'enterprise'
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    category: 'Retail',
    preview: '/api/placeholder/400/300',
    description: 'Full-featured online store with payment processing and inventory',
    features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Order Management'],
    industry: 'Retail',
    complexity: 'advanced'
  },
  {
    id: 'agency-portfolio',
    name: 'Creative Agency',
    category: 'Agency',
    preview: '/api/placeholder/400/300',
    description: 'Portfolio and project showcase for creative agencies',
    features: ['Portfolio Gallery', 'Case Studies', 'Team Profiles', 'Contact Forms'],
    industry: 'Creative',
    complexity: 'basic'
  },
  {
    id: 'financial-dashboard',
    name: 'Financial Dashboard',
    category: 'Finance',
    preview: '/api/placeholder/400/300',
    description: 'Comprehensive financial analytics and reporting platform',
    features: ['Real-time Charts', 'KPI Tracking', 'Report Generation', 'Data Export'],
    industry: 'Finance',
    complexity: 'enterprise'
  },
  {
    id: 'healthcare-portal',
    name: 'Healthcare Portal',
    category: 'Healthcare',
    preview: '/api/placeholder/400/300',
    description: 'Patient management and telemedicine platform',
    features: ['Patient Records', 'Appointment Booking', 'Telemedicine', 'Prescriptions'],
    industry: 'Healthcare',
    complexity: 'enterprise'
  },
  {
    id: 'education-lms',
    name: 'Learning Management',
    category: 'Education',
    preview: '/api/placeholder/400/300',
    description: 'Complete LMS with course management and student tracking',
    features: ['Course Builder', 'Student Progress', 'Assessments', 'Certificates'],
    industry: 'Education',
    complexity: 'advanced'
  }
]

const COMPONENTS: Component[] = [
  { id: 'header', name: 'Navigation Header', type: 'header', customizable: true, required: true, description: 'Main navigation and branding' },
  { id: 'sidebar', name: 'Side Navigation', type: 'sidebar', customizable: true, required: false, description: 'Secondary navigation panel' },
  { id: 'dashboard', name: 'Dashboard Widget', type: 'content', customizable: true, required: true, description: 'Main dashboard content area' },
  { id: 'analytics', name: 'Analytics Panel', type: 'widget', customizable: true, required: false, description: 'Charts and metrics display' },
  { id: 'user-profile', name: 'User Profile', type: 'widget', customizable: true, required: true, description: 'User account management' },
  { id: 'notifications', name: 'Notification Center', type: 'widget', customizable: true, required: false, description: 'Alert and message system' },
  { id: 'footer', name: 'Footer Section', type: 'footer', customizable: true, required: true, description: 'Bottom page content and links' }
]

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    period: 'month',
    features: ['Up to 3 brands', 'Basic templates', 'Standard support', '5GB storage'],
    limitations: ['No custom domain', 'Limited customization']
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    period: 'month',
    features: ['Up to 10 brands', 'All templates', 'Priority support', '50GB storage', 'Custom domains'],
    limitations: ['Advanced features limited']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    period: 'month',
    features: ['Unlimited brands', 'Custom templates', '24/7 support', 'Unlimited storage', 'White-label API', 'Custom integrations'],
    limitations: []
  }
]

export default function WhiteLabelPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('saas-platform')
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    name: 'My Brand',
    logo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    borderRadius: 8,
    customDomain: 'mybrand.com',
    features: ['dashboard', 'analytics', 'user-profile']
  })
  const [activeTab, setActiveTab] = useState('templates')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  const template = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0]

  const handleBrandConfigChange = (key: keyof BrandConfig, value: any) => {
    setBrandConfig(prev => ({ ...prev, [key]: value }))
  }

  const generateWhiteLabel = async () => {
    console.log('🎨 Generating white label app...')
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate generation process
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          return 100
        }
        return prev + Math.random() * 10
      })
    }, 500)

    // Mock generation process
    try {
      console.log('Template:', selectedTemplate)
      console.log('Brand Config:', brandConfig)
      console.log('Components:', COMPONENTS.filter(c => brandConfig.features.includes(c.id)))
    } catch (error) {
      console.error('Generation failed:', error)
      setIsGenerating(false)
    }
  }

  const exportCode = () => {
    console.log('💻 Exporting code...')
    const codePackage = {
      template: selectedTemplate,
      brandConfig,
      components: COMPONENTS.filter(c => brandConfig.features.includes(c.id)),
      styles: {
        primaryColor: brandConfig.primaryColor,
        secondaryColor: brandConfig.secondaryColor,
        accentColor: brandConfig.accentColor,
        fontFamily: brandConfig.fontFamily,
        borderRadius: brandConfig.borderRadius
      }
    }
    console.log('Code package ready:', codePackage)
  }

  const deployToCustomDomain = () => {
    console.log('🚀 Deploying to custom domain...')
    console.log('Domain:', brandConfig.customDomain)
  }

  // Preview Component
  const WhiteLabelPreview = () => {
    const getPreviewSize = () => {
      switch (previewMode) {
        case 'desktop': return { width: '100%', height: '600px' }
        case 'tablet': return { width: '768px', height: '600px' }
        case 'mobile': return { width: '375px', height: '600px' }
      }
    }

    const previewSize = getPreviewSize()

    return (
      <div className="flex justify-center">
        <div
          className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-2xl mx-auto"
          style={previewSize}
        >
          {/* Mock Header */}
          <div
            className="h-16 flex items-center justify-between px-6 border-b"
            style={{ backgroundColor: brandConfig.primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white font-bold">
                {brandConfig.name.charAt(0)}
              </div>
              <span className="text-white font-semibold">{brandConfig.name}</span>
            </div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded bg-white/20" />
              <div className="w-6 h-6 rounded bg-white/20" />
            </div>
          </div>

          {/* Mock Content */}
          <div className="flex h-full">
            {brandConfig.features.includes('sidebar') && (
              <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r p-4">
                <div className="space-y-2">
                  {['Dashboard', 'Analytics', 'Users', 'Settings'].map((item, i) => (
                    <div
                      key={i}
                      className="p-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                      style={{
                        borderRadius: `${brandConfig.borderRadius}px`,
                        backgroundColor: i === 0 ? brandConfig.accentColor + '20' : 'transparent'
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 p-6">
              {/* Mock Dashboard */}
              {brandConfig.features.includes('dashboard') && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4" style={{ fontFamily: brandConfig.fontFamily }}>
                    Dashboard Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 border rounded-lg"
                        style={{ borderRadius: `${brandConfig.borderRadius}px` }}
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-400">Metric {i}</div>
                        <div className="text-2xl font-bold" style={{ color: brandConfig.primaryColor }}>
                          {1234 * i}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mock Analytics */}
              {brandConfig.features.includes('analytics') && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: brandConfig.fontFamily }}>
                    Analytics
                  </h3>
                  <div
                    className="h-32 rounded-lg flex items-end justify-center p-4"
                    style={{
                      backgroundColor: brandConfig.secondaryColor + '20',
                      borderRadius: `${brandConfig.borderRadius}px`
                    }}
                  >
                    {[40, 70, 30, 90, 60, 80, 50].map((height, i) => (
                      <div
                        key={i}
                        className="w-6 mx-1 rounded-t"
                        style={{
                          height: `${height}%`,
                          backgroundColor: brandConfig.accentColor
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Mock User Profile */}
              {brandConfig.features.includes('user-profile') && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: brandConfig.fontFamily }}>
                    User Profile
                  </h3>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full"
                      style={{ backgroundColor: brandConfig.primaryColor }}
                    />
                    <div>
                      <div className="font-semibold">John Doe</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">john@example.com</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary level="page" name="White Label Solution">
      <div>
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium">
              <Crown className="w-4 h-4" />
              White Label Solution
            </div>
            <h1 className="text-4xl font-bold text-gradient">Custom Brand Platform</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create fully customized, white-labeled platforms with your brand identity and features
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1">
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="deployment">Deploy</TabsTrigger>
                  </TabsList>

                  <TabsContent value="templates" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Choose Template</h3>
                      <div className="space-y-2">
                        {TEMPLATES.map((template) => (
                          <motion.div
                            key={template.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedTemplate === template.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card hover:bg-accent/10'
                            }`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="branding" className="space-y-4">
                    <div className="p-6 text-center text-muted-foreground">
                      Branding configuration coming soon
                    </div>
                  </TabsContent>

                  <TabsContent value="components" className="space-y-4">
                    <div className="p-6 text-center text-muted-foreground">
                      Component selection coming soon
                    </div>
                  </TabsContent>

                  <TabsContent value="deployment" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Pricing Tiers</h3>
                      <div className="space-y-4">
                        {PRICING_TIERS.map((tier) => (
                          <div
                            key={tier.id}
                            className={`p-6 rounded-lg border-2 transition-all ${
                              tier.id === 'professional'
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold">{tier.name}</h4>
                              {tier.id === 'professional' && (
                                <Badge>Recommended</Badge>
                              )}
                            </div>
                            <div className="mb-4">
                              <span className="text-3xl font-bold">${tier.price}</span>
                              <span className="text-muted-foreground">/{tier.period}</span>
                            </div>
                            <div className="space-y-2 mb-4">
                              {tier.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
          <button
            data-testid="generate-white-label-btn"
            onClick={generateWhiteLabel}
            disabled={isGenerating}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? `Generating... ${Math.floor(generationProgress)}%` : 'Generate White Label'}
          </button>

          <button
            data-testid="export-code-btn"
            onClick={exportCode}
            className="px-6 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            Export Code
          </button>

          <button
            data-testid="deploy-domain-btn"
            onClick={deployToCustomDomain}
            className="px-6 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Deploy to Domain
          </button>
        </div>

        {isGenerating && (
          <div className="mt-4">
            <Progress value={generationProgress} className="h-2" />
          </div>
        )}

        {/* Preview Section */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Preview</h3>
            <WhiteLabelPreview />
          </Card>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}