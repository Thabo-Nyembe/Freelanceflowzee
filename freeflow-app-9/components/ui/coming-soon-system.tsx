'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { Card } from './card'
import {
  Rocket, Calendar, Bell, Mail, Sparkles, Zap, Star,
  Clock, CheckCircle, ArrowRight, X, ExternalLink,
  Palette, Video, FileText, Users, BarChart3, Shield,
  Globe, Brain, Wallet, Camera, Music, Code, Database,
  Cloud, Lock, Settings, Smartphone, Monitor, Headphones
} from 'lucide-react'

interface ComingSoonFeature {
  id: string
  title: string
  description: string
  icon: any
  category: 'ai' | 'collaboration' | 'productivity' | 'analytics' | 'creative' | 'business'
  priority: 'high' | 'medium' | 'low'
  estimatedDate: string
  progress: number
  tags: string[]
  benefits: string[]
}

const COMING_SOON_FEATURES: ComingSoonFeature[] = [
  // AI Features (True coming soon - not implemented yet)
  {
    id: 'ai-video-generation',
    title: 'AI Video Generation',
    description: 'Generate professional videos from text prompts with advanced AI technology',
    icon: Video,
    category: 'ai',
    priority: 'high',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['AI', 'Video', 'Generation', 'Automation'],
    benefits: ['Save 80% time on video creation', 'Professional quality output', 'Multiple format support']
  },
  {
    id: 'ai-code-completion',
    title: 'AI Code Completion',
    description: 'Advanced code suggestions and automatic bug detection',
    icon: Code,
    category: 'ai',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['AI', 'Development', 'Code', 'Productivity'],
    benefits: ['Faster development', 'Fewer bugs', 'Smart suggestions']
  },
  {
    id: 'ai-voice-synthesis',
    title: 'AI Voice Synthesis',
    description: 'Generate natural-sounding voiceovers in multiple languages',
    icon: Brain,
    category: 'ai',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['AI', 'Voice', 'Synthesis', 'Multilingual'],
    benefits: ['Natural voice generation', 'Multiple languages', 'Custom voice cloning']
  },

  // Advanced Collaboration Features (Not in current implementation)
  {
    id: 'voice-collaboration',
    title: 'Voice Collaboration',
    description: 'High-quality voice chat with spatial audio and noise cancellation',
    icon: Headphones,
    category: 'collaboration',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Voice', 'Audio', 'Communication', 'Spatial'],
    benefits: ['Crystal clear audio', 'Spatial positioning', 'Background noise removal']
  },
  {
    id: 'ar-collaboration',
    title: 'AR Collaboration',
    description: 'Augmented reality workspace for immersive team collaboration',
    icon: Globe,
    category: 'collaboration',
    priority: 'low',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['AR', 'Immersive', 'Collaboration', 'Innovation'],
    benefits: ['Immersive meetings', 'Spatial interaction', 'Future-ready technology']
  },
  {
    id: 'smart-translation',
    title: 'Real-time Translation',
    description: 'Instant translation for global team collaboration',
    icon: Globe,
    category: 'collaboration',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Translation', 'Global', 'Real-time', 'Communication'],
    benefits: ['Break language barriers', 'Global team support', 'Instant translation']
  },

  // Advanced Productivity Features
  {
    id: 'mobile-app',
    title: 'Native Mobile App',
    description: 'Native mobile app with full feature parity and offline support',
    icon: Smartphone,
    category: 'productivity',
    priority: 'high',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Mobile', 'Native', 'Offline', 'Sync'],
    benefits: ['Work anywhere', 'Offline capability', 'Native performance']
  },
  {
    id: 'desktop-app',
    title: 'Desktop Application',
    description: 'Native desktop application for Windows, Mac, and Linux',
    icon: Monitor,
    category: 'productivity',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Desktop', 'Native', 'Cross-platform', 'Performance'],
    benefits: ['Better performance', 'Offline access', 'System integration']
  },
  {
    id: 'browser-extension',
    title: 'Browser Extension',
    description: 'Browser extension for quick access and web integration',
    icon: ExternalLink,
    category: 'productivity',
    priority: 'low',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Browser', 'Extension', 'Integration', 'Quick Access'],
    benefits: ['Quick access', 'Web integration', 'Seamless workflow']
  },

  // Advanced Creative Features
  {
    id: 'audio-studio',
    title: 'Audio Studio',
    description: 'Complete audio editing suite with AI-powered noise reduction',
    icon: Music,
    category: 'creative',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Audio', 'Editing', 'Studio', 'AI'],
    benefits: ['Professional audio tools', 'AI noise reduction', 'Multi-track editing']
  },
  {
    id: '3d-modeling',
    title: '3D Modeling Studio',
    description: 'Professional 3D modeling and rendering capabilities',
    icon: Monitor,
    category: 'creative',
    priority: 'low',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['3D', 'Modeling', 'Rendering', 'Professional'],
    benefits: ['3D asset creation', 'Professional rendering', 'Export capabilities']
  },
  {
    id: 'motion-graphics',
    title: 'Motion Graphics',
    description: 'Advanced motion graphics and animation tools',
    icon: Zap,
    category: 'creative',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Motion', 'Graphics', 'Animation', 'Professional'],
    benefits: ['Professional animations', 'Motion templates', 'Export flexibility']
  },

  // Business Features
  {
    id: 'crypto-payments',
    title: 'Cryptocurrency Payments',
    description: 'Accept payments in major cryptocurrencies with instant conversion',
    icon: Wallet,
    category: 'business',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Crypto', 'Payments', 'Blockchain', 'Finance'],
    benefits: ['Global payments', 'Lower fees', 'Instant settlement']
  },
  {
    id: 'white-label',
    title: 'White Label Solution',
    description: 'Rebrand KAZI with your own company identity',
    icon: Palette,
    category: 'business',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['White Label', 'Branding', 'Enterprise', 'Customization'],
    benefits: ['Custom branding', 'Enterprise solution', 'Revenue sharing']
  },
  {
    id: 'marketplace',
    title: 'Plugin Marketplace',
    description: 'Third-party plugins and integrations marketplace',
    icon: Star,
    category: 'business',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Marketplace', 'Plugins', 'Integrations', 'Ecosystem'],
    benefits: ['Extend functionality', 'Third-party integrations', 'Monetization opportunities']
  },

  // Advanced Analytics (Beyond current implementation)
  {
    id: 'ml-insights',
    title: 'Machine Learning Insights',
    description: 'AI-powered business insights and predictive analytics',
    icon: Brain,
    category: 'analytics',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['ML', 'Insights', 'Predictive', 'Analytics'],
    benefits: ['Predictive insights', 'Business intelligence', 'Data-driven decisions']
  },
  {
    id: 'custom-reports',
    title: 'Custom Report Builder',
    description: 'Build custom reports with drag-and-drop interface',
    icon: BarChart3,
    category: 'analytics',
    priority: 'medium',
    estimatedDate: 'Available Now',
    progress: 100,
    tags: ['Reports', 'Custom', 'Builder', 'Analytics'],
    benefits: ['Custom reporting', 'Visual builder', 'Export options']
  }
]

const CATEGORY_COLORS = {
  ai: 'from-purple-500 to-pink-500',
  collaboration: 'from-blue-500 to-cyan-500',
  productivity: 'from-green-500 to-emerald-500',
  analytics: 'from-orange-500 to-red-500',
  creative: 'from-pink-500 to-rose-500',
  business: 'from-indigo-500 to-purple-500'
}

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: ComingSoonFeature
}

export function ComingSoonModal({ isOpen, onClose, feature }: ComingSoonModalProps) {
  if (!feature) return null

  const Icon = feature.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${CATEGORY_COLORS[feature.category]} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gradient">{feature.title}</h2>
                    <p className="text-muted-foreground">{feature.category.charAt(0).toUpperCase() + feature.category.slice(1)} Feature</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <p className="text-lg">{feature.description}</p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Development Progress</span>
                    <span className="text-sm text-muted-foreground">{feature.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${feature.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-2 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[feature.category]}`}
                    />
                  </div>
                </div>

                {/* Estimated Release */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Estimated Release: <strong>{feature.estimatedDate}</strong></span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Key Benefits
                  </h3>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="default"
                    className="flex-1 gap-2"
                    onClick={() => {
                      // Add to waitlist
                      console.log('Added to waitlist:', feature.id)
                      onClose()
                    }}
                  >
                    <Bell className="w-4 h-4" />
                    Get Notified
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      // Share feedback
                      console.log('Share feedback for:', feature.id)
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    Feedback
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ComingSoonSystemProps {
  featureId?: string
  trigger?: React.ReactNode
  showAll?: boolean
}

export function ComingSoonSystem({ featureId, trigger, showAll = false }: ComingSoonSystemProps) {
  const [selectedFeature, setSelectedFeature] = useState<ComingSoonFeature | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const feature = featureId ? COMING_SOON_FEATURES.find(f => f.id === featureId) : null
  const filteredFeatures = filterCategory === 'all'
    ? COMING_SOON_FEATURES
    : COMING_SOON_FEATURES.filter(f => f.category === filterCategory)

  if (featureId && trigger) {
    return (
      <>
        <div onClick={() => setSelectedFeature(feature || null)} className="cursor-pointer">
          {trigger}
        </div>
        <ComingSoonModal
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          feature={selectedFeature || undefined}
        />
      </>
    )
  }

  if (showAll) {
    const categories = ['all', 'ai', 'collaboration', 'productivity', 'analytics', 'creative', 'business']

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium"
          >
            <Rocket className="w-4 h-4" />
            Coming Soon Features
          </motion.div>
          <h1 className="text-4xl font-bold text-gradient">The Future of KAZI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the exciting features we're building to revolutionize your creative workflow
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All Features' : category}
            </Button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
                onClick={() => setSelectedFeature(feature)}
              >
                <Card className="p-6 h-full hover:shadow-2xl transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${CATEGORY_COLORS[feature.category]} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        feature.priority === 'high' ? 'bg-red-100 text-red-700' :
                        feature.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {feature.priority} Priority
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">{feature.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{feature.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[feature.category]}`}
                          style={{ width: `${feature.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{feature.estimatedDate}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <ComingSoonModal
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          feature={selectedFeature || undefined}
        />
      </div>
    )
  }

  return null
}

// Hook for easy coming soon integration
export function useComingSoon(featureId: string) {
  const [isOpen, setIsOpen] = useState(false)
  const feature = COMING_SOON_FEATURES.find(f => f.id === featureId)

  const showComingSoon = () => setIsOpen(true)
  const hideComingSoon = () => setIsOpen(false)

  const ComingSoonComponent = () => (
    <ComingSoonModal
      isOpen={isOpen}
      onClose={hideComingSoon}
      feature={feature}
    />
  )

  return {
    showComingSoon,
    hideComingSoon,
    ComingSoonComponent,
    feature
  }
}

export { COMING_SOON_FEATURES, type ComingSoonFeature }