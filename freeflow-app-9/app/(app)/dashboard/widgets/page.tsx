'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  WIDGET_TEMPLATES,
  DEFAULT_WIDGETS,
  WIDGET_METRICS,
  getSizeClass,
  getSizeLabel,
  getWidgetIcon,
  createWidget
} from '@/lib/widgets-utils'
import type { Widget, WidgetSize } from '@/lib/widgets-types'

type ViewMode = 'dashboard' | 'customize' | 'templates' | 'settings'

export default function WidgetsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS)
  const [isEditMode, setIsEditMode] = useState(false)

  const viewTabs = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: '📊' },
    { id: 'customize' as ViewMode, label: 'Customize', icon: '🎨' },
    { id: 'templates' as ViewMode, label: 'Templates', icon: '📋' },
    { id: 'settings' as ViewMode, label: 'Settings', icon: '⚙️' }
  ]

  const handleAddWidget = (templateId: string) => {
    const template = WIDGET_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    const newWidget = createWidget(template, { x: 0, y: widgets.length })
    setWidgets([...widgets, newWidget])
    setViewMode('dashboard')
  }

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
  }

  const handleToggleWidget = (widgetId: string) => {
    setWidgets(widgets.map(w =>
      w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
    ))
  }

  const handleChangeSize = (widgetId: string, size: WidgetSize) => {
    setWidgets(widgets.map(w =>
      w.id === widgetId ? { ...w, size } : w
    ))
  }

  const visibleWidgets = widgets.filter(w => w.isVisible)

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Dashboard Widgets
              </TextShimmer>
              <p className="text-muted-foreground">
                Customize your dashboard with draggable widgets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isEditMode
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                }`}
              >
                {isEditMode ? 'Done Editing' : 'Edit Layout'}
              </button>
              <button
                onClick={() => setViewMode('customize')}
                className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add Widget
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* View Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <>
            {isEditMode && (
              <ScrollReveal delay={0.2}>
                <LiquidGlassCard>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✏️</span>
                      <div className="flex-1">
                        <div className="font-semibold">Edit Mode Active</div>
                        <div className="text-sm text-muted-foreground">
                          Click widgets to resize or remove them
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>
            )}

            <ScrollReveal delay={0.3}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {visibleWidgets.map((widget, index) => (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={getSizeClass(widget.size)}
                  >
                    <LiquidGlassCard>
                      <div className="p-6 relative">
                        {/* Widget Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{widget.icon}</span>
                            <div>
                              <h3 className="font-bold">{widget.title}</h3>
                              <p className="text-xs text-muted-foreground">{widget.description}</p>
                            </div>
                          </div>
                          {isEditMode && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRemoveWidget(widget.id)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <span className="text-red-500">🗑️</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Widget Content */}
                        <div>
                          {widget.type === 'metric-card' && widget.config.metric && (
                            <div className="text-center">
                              <div className="text-4xl font-bold mb-2" style={{ color: widget.config.metric.color }}>
                                {typeof widget.config.metric.value === 'number'
                                  ? widget.config.metric.value.toLocaleString()
                                  : widget.config.metric.value}
                              </div>
                              {widget.config.metric.trend && widget.config.metric.changePercent !== undefined && (
                                <div className={`text-sm ${
                                  widget.config.metric.trend === 'up' ? 'text-green-500' :
                                  widget.config.metric.trend === 'down' ? 'text-red-500' :
                                  'text-gray-500'
                                }`}>
                                  {widget.config.metric.trend === 'up' ? '↗' : widget.config.metric.trend === 'down' ? '↘' : '→'}
                                  {' '}{Math.abs(widget.config.metric.changePercent).toFixed(1)}%
                                </div>
                              )}
                            </div>
                          )}

                          {widget.type === 'chart' && widget.config.chart && (
                            <div className="h-48 flex items-end justify-between gap-2">
                              {widget.config.chart.data.map((item, idx) => {
                                const maxValue = Math.max(...widget.config.chart!.data.map(d => d.value))
                                const height = (item.value / maxValue) * 100
                                return (
                                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <motion.div
                                      initial={{ height: 0 }}
                                      animate={{ height: `${height}%` }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600 to-cyan-400"
                                    />
                                    <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {widget.type === 'quick-actions' && widget.config.quickActions && (
                            <div className="grid grid-cols-2 gap-3">
                              {widget.config.quickActions.actions.map((action) => (
                                <Link
                                  key={action.id}
                                  href={action.action}
                                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2 text-center"
                                >
                                  <span className="text-3xl">{action.icon}</span>
                                  <span className="text-sm font-medium">{action.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}

                          {widget.type === 'activity-feed' && (
                            <div className="space-y-3">
                              {[
                                { icon: '💰', text: 'New payment received', time: '5 min ago' },
                                { icon: '👤', text: 'Client added', time: '1 hour ago' },
                                { icon: '📧', text: 'Email campaign sent', time: '2 hours ago' },
                                { icon: '📁', text: 'Project updated', time: '3 hours ago' }
                              ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                  <span className="text-xl">{item.icon}</span>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{item.text}</div>
                                    <div className="text-xs text-muted-foreground">{item.time}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Size Selector in Edit Mode */}
                        {isEditMode && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-xs font-medium mb-2">Widget Size:</div>
                            <div className="flex gap-2">
                              {(['small', 'medium', 'large'] as WidgetSize[]).map((size) => (
                                <button
                                  key={size}
                                  onClick={() => handleChangeSize(widget.id, size)}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    widget.size === size
                                      ? 'bg-cyan-500 text-white'
                                      : 'bg-muted hover:bg-muted/80'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </>
        )}

        {/* Customize View */}
        {viewMode === 'customize' && (
          <ScrollReveal delay={0.2}>
            <div className="space-y-6">
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Active Widgets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {widgets.map((widget) => (
                      <div
                        key={widget.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          widget.isVisible
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                            : 'border-gray-300 dark:border-gray-700 bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{widget.icon}</span>
                            <div>
                              <div className="font-semibold text-sm">{widget.title}</div>
                              <div className="text-xs text-muted-foreground capitalize">{widget.size}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleWidget(widget.id)}
                              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              {widget.isVisible ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <button
                              onClick={() => handleRemoveWidget(widget.id)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <span className="text-red-500 text-sm">🗑️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </ScrollReveal>
        )}

        {/* Templates View */}
        {viewMode === 'templates' && (
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {WIDGET_TEMPLATES.map((template) => (
                <LiquidGlassCard key={template.id}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-5xl">{template.icon}</span>
                      {template.isPremium && (
                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
                          Pro
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                    <div className="mb-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{template.type.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium capitalize">{template.defaultSize}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium capitalize">{template.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddWidget(template.id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Add to Dashboard
                    </button>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Settings View */}
        {viewMode === 'settings' && (
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Widget Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Total Widgets</span>
                      <span className="text-2xl font-bold text-blue-500">{WIDGET_METRICS.totalWidgets}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Active Widgets</span>
                      <span className="text-2xl font-bold text-green-500">{widgets.filter(w => w.isVisible).length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Favorite Widget</span>
                      <span className="text-sm font-bold text-purple-500">{WIDGET_METRICS.favoriteWidget}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Most Used Category</span>
                      <span className="text-sm font-bold text-orange-500 capitalize">{WIDGET_METRICS.mostUsedCategory}</span>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Dashboard Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <span>💾</span>
                      <span>Save Layout</span>
                    </button>
                    <button className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <span>📤</span>
                      <span>Export Configuration</span>
                    </button>
                    <button className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <span>📥</span>
                      <span>Import Configuration</span>
                    </button>
                    <button className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <span>🔄</span>
                      <span>Reset to Default</span>
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
