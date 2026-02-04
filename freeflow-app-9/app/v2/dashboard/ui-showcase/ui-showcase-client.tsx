'use client'
// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'


export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Heart, Star, Download, Settings, FileText, Layers } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('UIShowcase')


// ============================================================================
// V2 COMPETITIVE MOCK DATA - UiShowcase Context
// ============================================================================

const uiShowcaseAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const uiShowcaseCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const uiShowcasePredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const uiShowcaseActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside component to access state setters

export default function UiShowcaseClient() {
  const { userId, loading: _userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  React.useEffect(() => {
    if (userId) {      announce('UI showcase loaded', 'polite')
    }
  }, [userId, announce])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState(false)
  const [morphingLoading, setMorphingLoading] = useState(false)
  const [morphingSuccess, setMorphingSuccess] = useState(false)

  // Quick Action Dialog States
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // New Item Form State
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    type: 'component',
    category: 'buttons',
    description: '',
  })

  // Export Options State
  const [exportOptions, setExportOptions] = useState({
    format: 'json',
    includeStyles: true,
    includeAnimations: true,
    selectedComponents: [] as string[],
  })

  // Settings State
  const [showcaseSettings, setShowcaseSettings] = useState({
    theme: 'auto',
    animationsEnabled: true,
    showLabels: true,
    gridDensity: 'comfortable',
  })

  // Quick Actions with Dialog Openers
  const uiShowcaseQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewItemDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  // Handler Functions
  const handleCreateItem = () => {
    if (!newItemForm.name.trim()) {
      toast.error('Please enter an item name')
      return
    }
    toast.success(`Created new ${newItemForm.type}: ${newItemForm.name}`)
    setNewItemForm({ name: '', type: 'component', category: 'buttons', description: '' })
    setShowNewItemDialog(false)
    announce(`New ${newItemForm.type} ${newItemForm.name} created`, 'polite')
  }

  const handleExport = () => {
    const exportData = {
      format: exportOptions.format,
      includeStyles: exportOptions.includeStyles,
      includeAnimations: exportOptions.includeAnimations,
      components: exportOptions.selectedComponents.length > 0
        ? exportOptions.selectedComponents
        : ['all'],
      exportedAt: new Date().toISOString(),
    }

    // Simulate download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ui-showcase-export-${Date.now()}.${exportOptions.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Exported UI components as ${exportOptions.format.toUpperCase()}`)
    setShowExportDialog(false)
    announce('UI showcase exported successfully', 'polite')
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or backend
    localStorage.setItem('ui-showcase-settings', JSON.stringify(showcaseSettings))
    toast.success('Settings saved successfully')
    setShowSettingsDialog(false)
    announce('Settings saved', 'polite')
  }

  useEffect(() => {
    const loadUIShowcaseData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load UI showcase data
        const res = await fetch('/api/ui-showcase')
        if (!res.ok) throw new Error('Failed to load UI showcase')

        setIsLoading(false)
        announce('UI showcase loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load UI showcase')
        setIsLoading(false)
        announce('Error loading UI showcase', 'assertive')
      }
    }

    loadUIShowcaseData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = 'KAZI - UI Showcase'
  }, [])

  const handleMorphingClick = () => {
    setMorphingLoading(true)
    setTimeout(() => {
      setMorphingLoading(false)
      setMorphingSuccess(true)
      setTimeout(() => setMorphingSuccess(false), 2000)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto space-y-8">
          <CardSkeleton />
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Advanced UI Component Showcase
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
          Explore cutting-edge UI components inspired by the best modern design libraries
        </p>
      </div>

      {/* Enhanced Buttons Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Enhanced Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 text-center bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
            
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={uiShowcaseAIInsights} />
          <PredictiveAnalytics predictions={uiShowcasePredictions} />
          <CollaborationIndicator collaborators={uiShowcaseCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={uiShowcaseQuickActions} />
          <ActivityFeed activities={uiShowcaseActivities} />
        </div>
<h3 className="font-semibold mb-4">Magnetic Button</h3>
            <button
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                e.currentTarget.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0px, 0px) scale(1)';
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Hover Me
            </button>
          </div>

          <div className="p-6 text-center bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
            <h3 className="font-semibold mb-4">Ripple Effect</h3>
            <button
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={(e) => {
                const button = e.currentTarget;
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                  position: absolute;
                  width: ${size}px;
                  height: ${size}px;
                  background: rgba(255, 255, 255, 0.6);
                  border-radius: 50%;
                  transform: scale(0);
                  animation: ripple 0.6s linear;
                  left: ${x}px;
                  top: ${y}px;
                `;

                button.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
              }}
            >
              <Star className="w-4 h-4 mr-2" />
              Click for Ripples
            </button>
          </div>

          <div className="p-6 text-center bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
            <h3 className="font-semibold mb-4">Morphing Button</h3>
            <button
              className={`inline-flex items-center px-6 py-3 rounded-lg transition-all duration-500 ${
                morphingLoading
                  ? 'bg-yellow-500 text-white'
                  : morphingSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
              }`}
              onClick={handleMorphingClick}
            >
              <Star className="w-4 h-4 mr-2" />
              {morphingLoading ? 'Loading...' : morphingSuccess ? 'Success!' : 'Morph Me!'}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Cards Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Advanced Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Hover Me</h3>
                <p className="text-gray-600">From any direction</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden transform transition-transform duration-300 hover:rotate-1 hover:scale-105">
            <div className="p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">3D Shift Card</h3>
                <p className="text-gray-600">Move your mouse around</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Texture Card</h3>
                <p className="text-gray-600">With dot pattern</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-radial from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1), transparent)' }} />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Spotlight Effect</h3>
                <p className="text-gray-400">Light follows your cursor</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px)', backgroundSize: '20px 20px' }} />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Wave Pattern</h3>
                <p className="text-gray-600">Subtle wave texture</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Grid Pattern</h3>
                <p className="text-gray-600">Clean grid overlay</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Bento Grid Layout</h2>
        <div className="grid grid-cols-6 grid-rows-4 gap-4 h-96">
          <div className="col-span-3 row-span-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Large Card</h3>
              <p>Main featured content</p>
            </div>
          </div>

          <div className="col-span-2 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h4 className="font-semibold">Medium Card</h4>
              <p className="text-sm text-gray-600">Secondary content</p>
            </div>
          </div>

          <div className="col-span-1 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h5 className="font-semibold">Small</h5>
            </div>
          </div>

          <div className="col-span-1 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h5 className="font-semibold">Small</h5>
            </div>
          </div>

          <div className="col-span-2 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h4 className="font-semibold">Medium Card</h4>
              <p className="text-sm text-gray-600">Another card</p>
            </div>
          </div>

          <div className="col-span-1 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h5 className="font-semibold">Small</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Interactive Elements</h2>
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center">
            <h3 className="font-semibold mb-4">Dynamic Island</h3>
            <button
              className={`bg-black text-white rounded-full transition-all duration-500 ${
                dynamicIslandExpanded ? 'px-6 py-3' : 'px-4 py-2'
              }`}
              onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
            >
              {dynamicIslandExpanded ? 'Tap to Collapse' : 'Tap to Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </div>
              Create New UI Component
            </DialogTitle>
            <DialogDescription>
              Add a new component to the UI showcase library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
              <input
                type="text"
                value={newItemForm.name}
                onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                placeholder="e.g., Animated Card, Gradient Button"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Component Type</label>
              <select
                value={newItemForm.type}
                onChange={(e) => setNewItemForm({ ...newItemForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="component">Component</option>
                <option value="animation">Animation</option>
                <option value="pattern">Pattern</option>
                <option value="layout">Layout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newItemForm.category}
                onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="buttons">Buttons</option>
                <option value="cards">Cards</option>
                <option value="inputs">Inputs</option>
                <option value="navigation">Navigation</option>
                <option value="feedback">Feedback</option>
                <option value="data-display">Data Display</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newItemForm.description}
                onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                placeholder="Describe the component's purpose and features"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowNewItemDialog(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateItem}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Create Component
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <Download className="w-5 h-5" />
              </div>
              Export UI Components
            </DialogTitle>
            <DialogDescription>
              Export your UI showcase components and configurations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                {['json', 'css', 'tsx'].map((format) => (
                  <button
                    key={format}
                    onClick={() => setExportOptions({ ...exportOptions, format })}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      exportOptions.format === format
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Include Options</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStyles}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeStyles: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">Include Styles</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAnimations}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeAnimations: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">Include Animations</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Components</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {['Magnetic Button', 'Ripple Button', 'Morphing Button', 'Hover Card', '3D Shift Card', 'Texture Card', 'Spotlight Card', 'Dynamic Island', 'Bento Grid'].map((component) => (
                  <label key={component} className="flex items-center gap-2 cursor-pointer p-1">
                    <input
                      type="checkbox"
                      checked={exportOptions.selectedComponents.includes(component)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExportOptions({
                            ...exportOptions,
                            selectedComponents: [...exportOptions.selectedComponents, component]
                          })
                        } else {
                          setExportOptions({
                            ...exportOptions,
                            selectedComponents: exportOptions.selectedComponents.filter(c => c !== component)
                          })
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-xs text-gray-600">{component}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave unchecked to export all</p>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowExportDialog(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white">
                <Settings className="w-5 h-5" />
              </div>
              Showcase Settings
            </DialogTitle>
            <DialogDescription>
              Configure your UI showcase display preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                {[
                  { value: 'light', label: 'Light', icon: '☀️' },
                  { value: 'dark', label: 'Dark', icon: '🌙' },
                  { value: 'auto', label: 'Auto', icon: '🔄' },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setShowcaseSettings({ ...showcaseSettings, theme: theme.value })}
                    className={`px-4 py-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      showcaseSettings.theme === theme.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{theme.icon}</span>
                    <span className="text-sm">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grid Density</label>
              <select
                value={showcaseSettings.gridDensity}
                onChange={(e) => setShowcaseSettings({ ...showcaseSettings, gridDensity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Display Options</label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Enable Animations</span>
                </div>
                <div
                  onClick={() => setShowcaseSettings({ ...showcaseSettings, animationsEnabled: !showcaseSettings.animationsEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    showcaseSettings.animationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      showcaseSettings.animationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Show Component Labels</span>
                </div>
                <div
                  onClick={() => setShowcaseSettings({ ...showcaseSettings, showLabels: !showcaseSettings.showLabels })}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    showcaseSettings.showLabels ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      showcaseSettings.showLabels ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </label>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowSettingsDialog(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg hover:from-gray-700 hover:to-gray-900 transition-all"
            >
              Save Settings
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        @keyframes particle-explode {
          to {
            transform: translate(var(--dx), var(--dy));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}