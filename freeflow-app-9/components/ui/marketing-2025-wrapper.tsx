'use client'

import * as React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Import our 2025 GUI components for marketing
import Context7GUIProvider, {
  LightningDarkContainer,
  Spatial3DCard,
  KineticText,
  LiquidButton
} from './enhanced-gui-2025'

import {
  Sparkles,
  Zap,
  Brain,
  Eye,
  Hand,
  Palette,
  Globe,
  Star,
  ArrowRight,
  Cpu,
  Waves,
  Layers3,
  Target,
  Shield,
  Upload
} from 'lucide-react'

// Icon resolver for string icon names
const iconMap = {
  'Brain': Brain,
  'Target': Target,
  'Shield': Shield,
  'Zap': Zap,
  'Upload': Upload,
  'Sparkles': Sparkles,
  'Eye': Eye,
  'Hand': Hand,
  'Palette': Palette,
  'Globe': Globe,
  'Star': Star,
  'ArrowRight': ArrowRight,
  'Cpu': Cpu,
  'Waves': Waves,
  'Layers3': Layers3
}

function resolveIcon(iconName: string | React.ComponentType<any>): React.ComponentType<any> | null {
  if (typeof iconName === 'string') {
    return iconMap[iconName as keyof typeof iconMap] || null
  }
  return iconName
}

interface Marketing2025WrapperProps {
  children: React.ReactNode
  enableParallax?: boolean
  enableSpatial?: boolean
  enableAnimations?: boolean
  defaultMode?: '2025' | 'standard'
  heroSection?: boolean
  className?: string
}

// Marketing-specific wrapper with 2025 features
export function Marketing2025Wrapper({
  children,
  enableParallax = true,
  enableSpatial = true,
  enableAnimations = true,
  defaultMode = 'standard',
  heroSection = false,
  className
}: Marketing2025WrapperProps) {
  const [guiMode, setGuiMode] = React.useState<'standard' | '2025'>(defaultMode)
  const [showGUIPreview, setShowGUIPreview] = React.useState(false)

  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 1000], [0, -300])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  // Check localStorage for user preference
  React.useEffect(() => {
    const stored = localStorage.getItem('kazi-marketing-gui-mode')
    if (stored === '2025') {
      setGuiMode('2025')
    }
  }, [])

  const toggleGuiMode = () => {
    const newMode = guiMode === 'standard' ? '2025' : 'standard'
    setGuiMode(newMode)
    localStorage.setItem('kazi-marketing-gui-mode', newMode)
  }

  // Standard mode for marketing
  if (guiMode === 'standard') {
    return (
      <div className={cn("relative", className)}>
        {/* GUI Preview Banner */}
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 }}
        >
          <Card className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-xl border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Experience 2025 GUI</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleGuiMode}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Standard Marketing Content */}
        {children}
      </div>
    )
  }

  // Enhanced 2025 Marketing Mode
  return (
    <Context7GUIProvider
      features={{
        spatialMode: enableSpatial,
        adaptiveTheme: 'lightning-dark',
        interactionMode: 'hybrid',
        personalizedUI: true,
        aiDrivenPersonalization: false,
        zeroUIMode: false,
        kineticTypography: enableAnimations,
        microInteractions: enableAnimations,
        glassmorphism: true,
        liquidDesign: true,
        spatialComputing: enableSpatial,
        gestureControls: false,
        hapticFeedback: true,
        contextualAdaptation: false
      }}
    >
      <div className={cn("relative min-h-screen", className)}>
        <LightningDarkContainer className="min-h-screen">
          {/* 2025 Mode Toggle */}
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-black/60 backdrop-blur-xl border-cyan-400/30 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium">2025 GUI Active</span>
                  </div>
                  <LiquidButton
                    variant="secondary"
                    onClick={toggleGuiMode}
                    className="text-xs px-3 py-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Standard
                  </LiquidButton>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"
              style={{ y: enableParallax ? parallaxY : 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
              style={{ y: enableParallax ? parallaxY : 0 }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.6, 0.3, 0.6]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          {/* Enhanced Content */}
          <motion.div
            style={{ opacity: enableParallax ? opacity : 1 }}
          >
            <Enhanced2025MarketingContent
              enableSpatial={enableSpatial}
              enableAnimations={enableAnimations}
              heroSection={heroSection}
            >
              {children}
            </Enhanced2025MarketingContent>
          </motion.div>
        </LightningDarkContainer>
      </div>
    </Context7GUIProvider>
  )
}

// Enhanced Marketing Content Wrapper
function Enhanced2025MarketingContent({
  children,
  enableSpatial,
  enableAnimations,
  heroSection
}: {
  children: React.ReactNode
  enableSpatial: boolean
  enableAnimations: boolean
  heroSection: boolean
}) {
  if (heroSection && enableSpatial) {
    return (
      <div className="relative">
        {/* Spatial Hero Enhancement */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="grid grid-cols-8 grid-rows-6 h-full opacity-10">
            {Array(48).fill(0).map((_, i) => (
              <motion.div
                key={i}
                className="border border-cyan-400/20"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        </motion.div>

        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Enhanced Background Grid */}
      {enableAnimations && (
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      )}

      {children}
    </div>
  )
}

// Enhanced Marketing Cards
export function Enhanced2025MarketingCard({
  children,
  title,
  description,
  icon,
  gradient,
  badge,
  stats,
  className,
  ...props
}: {
  children?: React.ReactNode
  title?: string
  description?: string
  icon?: string | React.ComponentType<any>
  gradient?: string
  badge?: string
  stats?: Record<string, string>
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const Icon = icon ? resolveIcon(icon) : null
  return (
    <Spatial3DCard depth={0.5} className={cn("group", className)} {...props}>
      <div className="p-6 h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl">
        {/* Header */}
        {(Icon || title || badge) && (
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <motion.div
                  className={cn(
                    "p-3 rounded-xl bg-gradient-to-r",
                    gradient || "from-blue-500 to-purple-500"
                  )}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </motion.div>
              )}
              {title && (
                <div>
                  <KineticText
                    variant="wave"
                    trigger="hover"
                    className="text-xl font-bold text-white"
                  >
                    {title}
                  </KineticText>
                </div>
              )}
            </div>
            {badge && (
              <Badge className="bg-gradient-to-r from-cyan-400 to-purple-400 text-black font-medium">
                {badge}
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <motion.p
            className="text-gray-300 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(stats).map(([key, value], index) => (
              <motion.div
                key={key}
                className="text-center p-2 bg-white/5 rounded-lg border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <div className="text-lg font-bold text-cyan-400">{value}</div>
                <div className="text-xs text-gray-400 capitalize">{key}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </Spatial3DCard>
  )
}

// Enhanced Marketing Button
export function Enhanced2025MarketingButton({
  children,
  variant = 'primary',
  size = 'default',
  className,
  ...props
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <LiquidButton
      variant={variant}
      liquidEffect={true}
      morphOnHover={true}
      className={cn(
        size === 'sm' ? 'px-4 py-2 text-sm' :
        size === 'lg' ? 'px-8 py-4 text-lg' :
        'px-6 py-3',
        className
      )}
      {...props}
    >
      {children}
    </LiquidButton>
  )
}

// Enhanced Hero Section
export function Enhanced2025HeroSection({
  title,
  subtitle,
  description,
  actions,
  className
}: {
  title: string
  subtitle?: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative py-20 text-center", className)}>
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array(6).fill(0).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Subtitle */}
        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Badge className="bg-gradient-to-r from-purple-400 to-cyan-400 text-black font-medium text-sm px-4 py-2">
              {subtitle}
            </Badge>
          </motion.div>
        )}

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <KineticText
            variant="wave"
            trigger="auto"
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-cyan-400 to-purple-400 bg-clip-text text-transparent"
          >
            {title}
          </KineticText>
        </motion.div>

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        )}

        {/* Actions */}
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Back to Top Button Client Component
export function BackToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
      aria-label="Back to top"
    >
      <ArrowRight className="w-5 h-5 rotate-[-90deg]" />
    </button>
  )
}

export default Marketing2025Wrapper