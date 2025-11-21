/**
 * A+++ Utilities Showcase
 * Comprehensive demonstration of all A+++ grade utilities
 */

'use client'

import { useState } from 'react'
import { Loader2, FileX, CheckCircle2, Keyboard as KeyboardIcon, Eye, Search, Lightbulb } from 'lucide-react'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip'

// A+++ Utilities
import {
  DashboardSkeleton,
  CardSkeleton,
  ListSkeleton,
  FormSkeleton
} from '@/components/ui/loading-skeleton'
import {
  NoDataEmptyState,
  ErrorEmptyState,
  SuccessEmptyState
} from '@/components/ui/empty-state'
import { FormValidator, ValidationSchemas } from '@/lib/validation'
import { useAnnouncer, AriaHelpers } from '@/lib/accessibility'
import { useKeyboardShortcuts } from '@/lib/keyboard-shortcuts'
import { generateMetadata } from '@/lib/seo'
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal'

type DemoSection = 'loading' | 'empty' | 'validation' | 'keyboard' | 'accessibility' | 'seo'

export default function APlusShowcase() {
  const [activeSection, setActiveSection] = useState<DemoSection>('loading')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmpty, setShowEmpty] = useState<'none' | 'nodata' | 'error' | 'success'>('none')
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { announce } = useAnnouncer()

  // Keyboard shortcuts for this page
  useKeyboardShortcuts([
    {
      key: '1',
      altKey: true,
      description: 'Show Loading Section',
      action: () => {
        setActiveSection('loading')
        announce('Switched to Loading Section')
      }
    },
    {
      key: '2',
      altKey: true,
      description: 'Show Empty States Section',
      action: () => {
        setActiveSection('empty')
        announce('Switched to Empty States Section')
      }
    },
    {
      key: '3',
      altKey: true,
      description: 'Show Validation Section',
      action: () => {
        setActiveSection('validation')
        announce('Switched to Validation Section')
      }
    }
  ])

  // Simulate loading
  const triggerLoading = () => {
    setIsLoading(true)
    announce('Loading started', 'polite')
    setTimeout(() => {
      setIsLoading(false)
      announce('Loading complete', 'polite')
    }, 2000)
  }

  // Validate form
  const validateForm = () => {
    const validator = new FormValidator()

    validator
      .validate('email', formData.email, ValidationSchemas.email)
      .validate('password', formData.password, ValidationSchemas.password)
      .validate('name', formData.name, ValidationSchemas.name)

    const errors = validator.getErrors()
    setFormErrors(errors)

    if (!validator.hasErrors()) {
      announce('Form validation passed', 'polite')
      setShowEmpty('success')
    } else {
      announce(`Form has ${Object.keys(errors).length} errors`, 'assertive')
    }
  }

  const sections: { id: DemoSection; label: string; Icon: any }[] = [
    { id: 'loading', label: 'Loading States', Icon: Loader2 },
    { id: 'empty', label: 'Empty States', Icon: FileX },
    { id: 'validation', label: 'Validation', Icon: CheckCircle2 },
    { id: 'keyboard', label: 'Keyboard Shortcuts', Icon: KeyboardIcon },
    { id: 'accessibility', label: 'Accessibility', Icon: Eye },
    { id: 'seo', label: 'SEO', Icon: Search }
  ]

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                A+++ Utilities Showcase
              </TextShimmer>
              <p className="text-muted-foreground">
                Professional-grade components and utilities demonstration
              </p>
            </div>
            <InfoTooltip
              content="This page demonstrates all A+++ grade utilities: loading states, empty states, validation, keyboard shortcuts, and accessibility features."
              position="left"
            />
          </div>
        </ScrollReveal>

        {/* Section Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sections.map((section) => {
              const Icon = section.Icon
              return (
                <Tooltip key={section.id} content={`Alt + ${sections.indexOf(section) + 1}`} position="bottom">
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                    {...AriaHelpers.tab(activeSection === section.id, `panel-${section.id}`)}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                </Tooltip>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Loading States Section */}
        {activeSection === 'loading' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Loading Skeletons</h2>
                  <p className="text-muted-foreground">
                    Professional skeleton loaders improve perceived performance
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={triggerLoading}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    {...AriaHelpers.loading(isLoading)}
                  >
                    {isLoading ? 'Loading...' : 'Trigger Loading Demo'}
                  </button>

                  {isLoading ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Dashboard Skeleton</h3>
                        <DashboardSkeleton />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Card Skeleton</h3>
                        <CardSkeleton />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-4">List Skeleton</h3>
                        <ListSkeleton items={3} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Form Skeleton</h3>
                        <FormSkeleton fields={3} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Empty States Section */}
        {activeSection === 'empty' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Empty State Components</h2>
                  <p className="text-muted-foreground">
                    Helpful empty states guide users when no data exists
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEmpty('nodata')}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Show No Data
                  </button>
                  <button
                    onClick={() => setShowEmpty('error')}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Show Error
                  </button>
                  <button
                    onClick={() => setShowEmpty('success')}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Show Success
                  </button>
                  <button
                    onClick={() => setShowEmpty('none')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Hide All
                  </button>
                </div>

                <div className="min-h-[400px]">
                  {showEmpty === 'nodata' && <NoDataEmptyState entityName="projects" />}
                  {showEmpty === 'error' && <ErrorEmptyState error="Failed to load data. Please try again." />}
                  {showEmpty === 'success' && <SuccessEmptyState title="Success!" description="Your form was validated successfully!" />}
                  {showEmpty === 'none' && (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      Click a button above to see empty state examples
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Validation Section */}
        {activeSection === 'validation' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Form Validation</h2>
                  <p className="text-muted-foreground">
                    Comprehensive validation with helpful error messages
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <InfoTooltip content="Must be a valid email address" />
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="your@email.com"
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? 'email-error' : undefined}
                    />
                    {formErrors.email && (
                      <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Password <InfoTooltip content="Min 8 chars, uppercase, lowercase, number, special char" />
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="********"
                      aria-invalid={!!formErrors.password}
                      aria-describedby={formErrors.password ? 'password-error' : undefined}
                    />
                    {formErrors.password && (
                      <p id="password-error" className="text-red-500 text-sm mt-1" role="alert">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name <InfoTooltip content="Min 2 chars, max 50 chars" />
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="John Doe"
                      aria-invalid={!!formErrors.name}
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                    />
                    {formErrors.name && (
                      <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={validateForm}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Validate Form
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Keyboard Shortcuts Section */}
        {activeSection === 'keyboard' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Keyboard Shortcuts</h2>
                  <p className="text-muted-foreground">
                    Powerful keyboard navigation for efficient workflows
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Global Shortcuts</h3>
                    <div className="space-y-3">
                      {[
                        { keys: 'Alt + H', action: 'Go to Dashboard' },
                        { keys: 'Alt + P', action: 'Go to Projects' },
                        { keys: 'Alt + M', action: 'Go to Messages' },
                        { keys: 'Alt + S', action: 'Go to Settings' },
                        { keys: 'Ctrl + /', action: 'Focus Search' },
                        { keys: '?', action: 'Show Shortcuts Help' }
                      ].map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">{shortcut.action}</span>
                          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">
                            {shortcut.keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Page Shortcuts</h3>
                    <div className="space-y-3">
                      {[
                        { keys: 'Alt + 1', action: 'Loading States Section' },
                        { keys: 'Alt + 2', action: 'Empty States Section' },
                        { keys: 'Alt + 3', action: 'Validation Section' },
                        { keys: 'Escape', action: 'Close Modals' },
                        { keys: 'Enter', action: 'Submit Forms' }
                      ].map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">{shortcut.action}</span>
                          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">
                            {shortcut.keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs font-mono mx-1">?</kbd>
                    to see all available keyboard shortcuts in any page.
                  </p>
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Accessibility Section */}
        {activeSection === 'accessibility' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Accessibility Features</h2>
                  <p className="text-muted-foreground">
                    WCAG AA compliant utilities for inclusive design
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Screen Reader Support</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>ARIA live regions for announcements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Semantic HTML throughout</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Proper heading hierarchy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Alt text for images</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Keyboard Navigation</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Focus trap in modals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Skip to main content link</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Visible focus indicators</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Keyboard shortcuts</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Test Announcer</h3>
                  <button
                    onClick={() => announce('This is a test announcement for screen readers!', 'polite')}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Test Screen Reader Announcement
                  </button>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will announce a message to screen readers (enable your screen reader to hear it)
                  </p>
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* SEO Section */}
        {activeSection === 'seo' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">SEO Optimization</h2>
                  <p className="text-muted-foreground">
                    Dynamic metadata generation for optimal search engine visibility
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: 'Dynamic Metadata', desc: 'Automatic title, description, keywords' },
                        { title: 'Open Graph', desc: 'Social media preview optimization' },
                        { title: 'Twitter Cards', desc: 'Twitter-specific metadata' },
                        { title: 'Canonical URLs', desc: 'Prevent duplicate content' },
                        { title: 'Structured Data', desc: 'JSON-LD for rich snippets' },
                        { title: 'URL Slugs', desc: 'SEO-friendly URL generation' }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Search className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm">{feature.title}</div>
                            <div className="text-xs text-muted-foreground">{feature.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Page Metadata</h4>
                    <code className="text-xs text-green-700 dark:text-green-300 block overflow-x-auto">
                      {JSON.stringify(generateMetadata({
                        title: 'A+++ Showcase - KAZI Platform',
                        description: 'Professional utilities demonstration'
                      }), null, 2)}
                    </code>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />
    </div>
  )
}
