'use client'

/**
 * System Insights Dashboard
 * Showcase of structured logging and enhanced toast notifications
 * Demonstrates all the logger and toast improvements
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Bell,
  Code,
  Copy,
  Database,
  Download,
  FileText,
  Loader2,
  Save,
  Send,
  Settings,
  TrendingUp,
  Upload,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Eye,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('SystemInsights')

export default function SystemInsightsPage() {
  const [loading, setLoading] = useState(false)

  // Demo: Success Toast with Data
  const showSuccessToast = () => {
    logger.info('Success toast demonstrated', {
      type: 'demo',
      category: 'success-toast'
    })

    toast.success('Operation Completed Successfully', {
      description: '5 files processed • 2.3 MB • 1.2s',
      icon: <CheckCircle2 className="h-5 w-5" />
    })
  }

  // Demo: Error Toast with Error ID
  const showErrorToast = () => {
    const errorId = `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    logger.error('Error toast demonstrated', {
      type: 'demo',
      errorId,
      category: 'error-toast'
    })

    toast.error('Operation Failed', {
      description: `Something went wrong • Error ID: ${errorId}`,
      icon: <XCircle className="h-5 w-5" />
    })
  }

  // Demo: Copy Toast with Character Count
  const showCopyToast = () => {
    const content = 'const greeting = "Hello, World!";'

    logger.info('Copy toast demonstrated', {
      type: 'demo',
      contentLength: content.length,
      category: 'copy-toast'
    })

    toast.success('Code Copied', {
      description: `${content.length} characters copied to clipboard`,
      icon: <Copy className="h-5 w-5" />
    })
  }

  // Demo: File Operation Toast
  const showFileToast = () => {
    logger.info('File toast demonstrated', {
      type: 'demo',
      fileName: 'project-data.json',
      fileSize: '1.2 MB',
      category: 'file-toast'
    })

    toast.success('File Downloaded', {
      description: 'project-data.json • 1.2 MB',
      icon: <Download className="h-5 w-5" />
    })
  }

  // Demo: Progress Toast
  const showProgressToast = () => {
    setLoading(true)

    const promise = new Promise((resolve) => {
      setTimeout(resolve, 3000)
    })

    toast.promise(promise, {
      loading: 'Processing video... 0%',
      success: 'Video processed successfully • 5 scenes detected • 2.3s',
      error: 'Video processing failed',
    })

    promise.finally(() => setLoading(false))
  }

  // Demo: Action Toast with Undo
  const showActionToast = () => {
    logger.info('Action toast demonstrated', {
      type: 'demo',
      action: 'delete',
      itemCount: 3,
      category: 'action-toast'
    })

    toast('3 Items Deleted', {
      description: 'Files moved to trash • Undo available for 30s',
      icon: <Trash2 className="h-5 w-5" />,
      action: {
        label: 'Undo',
        onClick: () => {
          logger.info('Undo action triggered', { type: 'demo' })
          toast.success('Items Restored')
        }
      }
    })
  }

  // Demo: Metric Toast
  const showMetricToast = () => {
    logger.info('Metric toast demonstrated', {
      type: 'demo',
      metric: 'API Response Time',
      value: 145,
      trend: 'improved',
      category: 'metric-toast'
    })

    toast('API Performance', {
      description: '📈 Response time: 145ms (32% faster)',
      icon: <TrendingUp className="h-5 w-5" />
    })
  }

  // Demo: Data Operation Toast
  const showDataToast = () => {
    logger.info('Data toast demonstrated', {
      type: 'demo',
      operation: 'sync',
      recordCount: 247,
      category: 'data-toast'
    })

    toast.success('Data Synchronized', {
      description: '247 records updated • Last sync: just now',
      icon: <Database className="h-5 w-5" />
    })
  }

  // Demo: Multiple Toast Types
  const showMultipleToasts = () => {
    logger.info('Multiple toasts demonstrated', {
      type: 'demo',
      count: 5,
      category: 'multiple-toasts'
    })

    toast.success('Task 1 Complete', { description: 'File uploaded' })
    setTimeout(() => toast.success('Task 2 Complete', { description: 'Data processed' }), 500)
    setTimeout(() => toast.success('Task 3 Complete', { description: 'Report generated' }), 1000)
    setTimeout(() => toast.success('Task 4 Complete', { description: 'Email sent' }), 1500)
    setTimeout(() => toast.success('All Tasks Complete', { description: '4/4 completed successfully' }), 2000)
  }

  const demoCategories = [
    {
      title: 'Success Operations',
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
      demos: [
        { label: 'Success Toast', action: showSuccessToast, description: 'Shows file count, size, duration' },
        { label: 'File Download', action: showFileToast, description: 'Displays filename and size' },
        { label: 'Data Sync', action: showDataToast, description: 'Record count and timestamp' }
      ]
    },
    {
      title: 'Copy Operations',
      icon: Copy,
      color: 'from-blue-500 to-cyan-500',
      demos: [
        { label: 'Copy Code', action: showCopyToast, description: 'Shows character count' },
        { label: 'Copy with Data', action: showCopyToast, description: 'Rich context information' }
      ]
    },
    {
      title: 'Error Handling',
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
      demos: [
        { label: 'Error with ID', action: showErrorToast, description: 'Includes unique error identifier' }
      ]
    },
    {
      title: 'Progress & Loading',
      icon: Loader2,
      color: 'from-purple-500 to-violet-500',
      demos: [
        { label: 'Progress Toast', action: showProgressToast, description: 'Loading → Success states', disabled: loading }
      ]
    },
    {
      title: 'Interactive Actions',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      demos: [
        { label: 'Action with Undo', action: showActionToast, description: 'Undo capability' },
        { label: 'Multiple Tasks', action: showMultipleToasts, description: 'Sequential toasts' }
      ]
    },
    {
      title: 'Metrics & Analytics',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      demos: [
        { label: 'Performance Metric', action: showMetricToast, description: 'Shows trends and improvements' }
      ]
    }
  ]

  const loggerFeatures = [
    {
      title: 'Structured Context',
      description: 'All logs include rich context objects with operation metadata',
      icon: Code,
      example: { operation: 'copy', contentLength: 245, language: 'typescript' }
    },
    {
      title: 'Error Tracking',
      description: 'Comprehensive error tracking with stack traces and error IDs',
      icon: AlertCircle,
      example: { errorId: 'err-123-abc', stack: '...', message: 'Operation failed' }
    },
    {
      title: 'Performance Metrics',
      description: 'Track operation duration, response times, and resource usage',
      icon: TrendingUp,
      example: { duration: '2.3s', responseTime: 145, scenes: 5 }
    },
    {
      title: 'User Actions',
      description: 'Log all user interactions with detailed context',
      icon: Activity,
      example: { userId: 'user_123', action: 'file_download', timestamp: '2024-01-01' }
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <Activity className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          System Insights Dashboard
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Explore our enhanced logging system and real toast notifications with rich data
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Loggers', value: '52', icon: Code, color: 'from-blue-500 to-cyan-500' },
          { label: 'Toast Notifications', value: '1,247', icon: Bell, color: 'from-purple-500 to-pink-500' },
          { label: 'Events Logged', value: '8,392', icon: Activity, color: 'from-green-500 to-emerald-500' },
          { label: 'Error Tracking', value: '100%', icon: CheckCircle2, color: 'from-yellow-500 to-orange-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="demos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demos">Toast Demos</TabsTrigger>
          <TabsTrigger value="features">Logger Features</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
        </TabsList>

        {/* Toast Demos Tab */}
        <TabsContent value="demos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                        <category.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                    <CardDescription>
                      Click buttons below to see toast notifications in action
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.demos.map((demo) => (
                      <div key={demo.label} className="space-y-1">
                        <Button
                          onClick={demo.action}
                          disabled={demo.disabled}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          {demo.disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {demo.label}
                        </Button>
                        <p className="text-xs text-muted-foreground px-3">
                          {demo.description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Logger Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loggerFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                      <pre>{JSON.stringify(feature.example, null, 2)}</pre>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Code Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Examples</CardTitle>
              <CardDescription>See how we implemented structured logging and toasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Example 1: Success Toast */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Success Toast with Data
                </h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`logger.info('Code copied to clipboard', {
  language: 'typescript',
  contentLength: 245
});

toast.success('Code Copied', {
  description: \`\${content.length} characters copied\`
});`}</pre>
                </div>
              </div>

              {/* Example 2: Error Toast */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Error Toast with Error ID
                </h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`logger.error('Auth check failed', {
  error: error.message,
  stack: error.stack,
  pathname,
  requireAuth,
  requiredRole
});

toast.error('Authorization Failed', {
  description: 'Please log in to access this page'
});`}</pre>
                </div>
              </div>

              {/* Example 3: File Operation */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-500" />
                  File Operation with Metadata
                </h3>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`logger.info('File downloaded', {
  fileName: 'project-data.json',
  fileSize: '1.2 MB',
  format: 'JSON'
});

toast.success('File Downloaded', {
  description: 'project-data.json • 1.2 MB'
});`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-2xl">Benefits of Structured Logging & Rich Toasts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Better Debugging',
              description: 'Rich context and error IDs make debugging faster and easier',
              icon: Code
            },
            {
              title: 'User Feedback',
              description: 'Informative toasts with actual data improve user experience',
              icon: Eye
            },
            {
              title: 'Monitoring',
              description: 'Track operations, performance, and errors in real-time',
              icon: Activity
            }
          ].map((benefit) => (
            <div key={benefit.title} className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
