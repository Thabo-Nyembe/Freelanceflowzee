
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Cloud,
  HardDrive,
  Upload,
  Download,
  RefreshCw,
  Settings,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  Link
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function CloudStoragePage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // A+++ LOAD CLOUD STORAGE DATA
  useEffect(() => {
    const loadCloudStorageData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load cloud storage'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Cloud storage loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cloud storage')
        setIsLoading(false)
        announce('Error loading cloud storage', 'assertive')
      }
    }

    loadCloudStorageData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Mock cloud storage data
  const cloudProviders = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: '📁',
      connected: true,
      totalSpace: '15 GB',
      usedSpace: '8.2 GB',
      usagePercent: 55,
      files: 1247,
      lastRefreshCw: '2 minutes ago',
      status: 'active'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      connected: true,
      totalSpace: '2 TB',
      usedSpace: '458 GB',
      usagePercent: 23,
      files: 2893,
      lastRefreshCw: '5 minutes ago',
      status: 'active'
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '☁️',
      connected: false,
      totalSpace: '1 TB',
      usedSpace: '0 GB',
      usagePercent: 0,
      files: 0,
      lastRefreshCw: 'Never',
      status: 'disconnected'
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      icon: '🗃️',
      connected: true,
      totalSpace: 'Unlimited',
      usedSpace: '127 GB',
      usagePercent: null,
      files: 5642,
      lastRefreshCw: '1 hour ago',
      status: 'syncing'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      action: 'uploaded',
      file: 'Project Proposal.pdf',
      provider: 'Google Drive',
      time: '5 minutes ago',
      size: '2.4 MB'
    },
    {
      id: 2,
      action: 'downloaded',
      file: 'Brand Assets.zip',
      provider: 'Dropbox',
      time: '15 minutes ago',
      size: '45.2 MB'
    },
    {
      id: 3,
      action: 'synced',
      file: 'Design Files',
      provider: 'AWS S3',
      time: '1 hour ago',
      size: '156 files'
    },
    {
      id: 4,
      action: 'shared',
      file: 'Client Presentation.pptx',
      provider: 'Google Drive',
      time: '2 hours ago',
      size: '12.8 MB'
    }
  ]

  const storageStats = {
    totalFiles: cloudProviders.reduce((sum, provider) => sum + provider.files, 0),
    totalUsed: '593.4 GB',
    totalAvailable: '3.02 TB',
    connectedProviders: cloudProviders.filter(p => p.connected).length,
    totalProviders: cloudProviders.length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'syncing': return 'bg-blue-100 text-blue-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'disconnected': return <AlertCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={4} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Cloud Storage</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your cloud storage providers and files</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Connect Storage
          </Button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 kazi-text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-primary">{storageStats.totalFiles.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Across all providers</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{storageStats.totalUsed}</div>
            <p className="text-xs text-gray-500">of {storageStats.totalAvailable} available</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Cloud className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{storageStats.connectedProviders}</div>
            <p className="text-xs text-gray-500">of {storageStats.totalProviders} providers</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RefreshCw Status</CardTitle>
            <RefreshCw className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Active</div>
            <p className="text-xs text-gray-500">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cloud Providers */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Cloud Providers
              </CardTitle>
              <CardDescription>Manage your connected cloud storage services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cloudProviders.map((provider) => (
                  <Card key={provider.id} className="kazi-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{provider.icon}</div>
                          <div>
                            <h3 className="font-semibold">{provider.name}</h3>
                            <p className="text-sm text-gray-500">{provider.files.toLocaleString()} files</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(provider.status)}>
                            {getStatusIcon(provider.status)}
                            <span className="ml-1 capitalize">{provider.status}</span>
                          </Badge>
                          {provider.connected ? (
                            <Button size="sm" variant="outline">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm">
                              Connect
                            </Button>
                          )}\n                        </div>
                      </div>
                      
                      {provider.connected && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Storage Usage</span>
                            <span>{provider.usedSpace} / {provider.totalSpace}</span>
                          </div>
                          {provider.usagePercent !== null && (
                            <Progress value={provider.usagePercent} className="w-full" />
                          )}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Last sync: {provider.lastRefreshCw}</span>
                            {provider.usagePercent !== null && (
                              <span>{provider.usagePercent}% used</span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest cloud storage activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      {activity.action === 'uploaded' && <Upload className="h-4 w-4 text-blue-600" />}
                      {activity.action === 'downloaded' && <Download className="h-4 w-4 text-blue-600" />}
                      {activity.action === 'synced' && <RefreshCw className="h-4 w-4 text-blue-600" />}
                      {activity.action === 'shared' && <Users className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium capitalize">{activity.action}</span>{' '}
                        <span className="font-medium">{activity.file}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{activity.provider}</span>
                        <span>•</span>
                        <span>{activity.size}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Upload Files</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                  <RefreshCw className="h-5 w-5" />
                  <span className="text-xs">RefreshCw All</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                  <Shield className="h-5 w-5" />
                  <span className="text-xs">Backup</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                  <Link className="h-5 w-5" />
                  <span className="text-xs">Share Link</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Storage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Storage Analytics
          </CardTitle>
          <CardDescription>Detailed storage usage and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Storage analytics and insights coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 