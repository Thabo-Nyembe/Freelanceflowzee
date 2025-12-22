'use client'

import { useState } from 'react'
import { useMobileApp, MobileAppFeature, MobileAppVersion, MobileAppStats } from '@/lib/hooks/use-mobile-app'
import { createMobileFeature, updateMobileFeature, deleteMobileFeature, createMobileVersion, activateFeature, deactivateFeature } from '@/app/actions/mobile-app'

interface MobileAppClientProps {
  initialFeatures: MobileAppFeature[]
  initialVersions: MobileAppVersion[]
  initialStats: MobileAppStats
}

export default function MobileAppClient({ initialFeatures, initialVersions, initialStats }: MobileAppClientProps) {
  const { features, versions, stats } = useMobileApp(initialFeatures, initialVersions, initialStats)
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'ios' | 'android'>('all')
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', feature_type: 'standard' as const, platform: 'all' as const, icon_color: 'from-blue-500 to-cyan-500' })
  const [versionForm, setVersionForm] = useState({ version: '', platform: 'all' as const, release_notes: '', features: [] as string[] })

  const filteredFeatures = features.filter(f => selectedPlatform === 'all' || f.platform === 'all' || f.platform === selectedPlatform)

  const statsDisplay = [
    { label: 'Total Downloads', value: `${(stats.totalDownloads / 1000).toFixed(0)}K`, change: 42.1 },
    { label: 'Active Users', value: `${(stats.totalUsers / 1000).toFixed(0)}K`, change: 35.3 },
    { label: 'App Rating', value: stats.avgRating.toFixed(1), change: 8.2 },
    { label: 'Avg Engagement', value: `${stats.avgEngagement.toFixed(0)}%`, change: 25.7 }
  ]

  const handleCreateFeature = async () => {
    try {
      await createMobileFeature(featureForm)
      setShowFeatureModal(false)
      setFeatureForm({ title: '', description: '', feature_type: 'standard', platform: 'all', icon_color: 'from-blue-500 to-cyan-500' })
    } catch (error) {
      console.error('Failed to create feature:', error)
    }
  }

  const handleCreateVersion = async () => {
    try {
      await createMobileVersion(versionForm)
      setShowVersionModal(false)
      setVersionForm({ version: '', platform: 'all', release_notes: '', features: [] })
    } catch (error) {
      console.error('Failed to create version:', error)
    }
  }

  const handleToggleFeature = async (feature: MobileAppFeature) => {
    if (feature.status === 'active') {
      await deactivateFeature(feature.id)
    } else {
      await activateFeature(feature.id)
    }
  }

  const handleDeleteFeature = async (id: string) => {
    if (confirm('Delete this feature?')) {
      await deleteMobileFeature(id)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      beta: 'bg-blue-100 text-blue-700',
      stable: 'bg-green-100 text-green-700',
      deprecated: 'bg-gray-100 text-gray-700',
      inactive: 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="w-10 h-10 text-indigo-600">📱</span>
              Mobile App
            </h1>
            <p className="text-gray-600">Manage your mobile presence and engagement</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowVersionModal(true)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-slate-800">
              New Version
            </button>
            <button onClick={() => setShowFeatureModal(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg">
              Add Feature
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {statsDisplay.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">+{stat.change}%</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {(['all', 'ios', 'android'] as const).map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPlatform === platform ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {platform === 'all' ? 'All Platforms' : platform.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">App Features ({filteredFeatures.length})</h3>
              {filteredFeatures.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No features found</p>
                  <button onClick={() => setShowFeatureModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add Feature</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFeatures.map(feature => (
                    <div key={feature.id} className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.icon_color || 'from-blue-500 to-cyan-500'} flex items-center justify-center text-white text-xl`}>
                          📱
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{feature.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(feature.status)}`}>{feature.status}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-gray-500">Users</span><p className="font-semibold">{((feature.users_count || 0) / 1000).toFixed(1)}K</p></div>
                            <div><span className="text-gray-500">Engagement</span><p className="font-semibold">{feature.engagement_percent || 0}%</p></div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => handleToggleFeature(feature)} className={`px-3 py-1 rounded text-xs ${feature.status === 'active' ? 'bg-gray-100' : 'bg-green-100 text-green-700'}`}>
                              {feature.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => handleDeleteFeature(feature.id)} className="px-3 py-1 rounded text-xs bg-red-100 text-red-700">Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4">App Versions ({versions.length})</h3>
              <div className="space-y-3">
                {versions.map(version => (
                  <div key={version.id} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Version {version.version}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(version.status)}`}>{version.status}</span>
                        </div>
                        <p className="text-xs text-gray-500">{version.platform} • {version.release_date ? new Date(version.release_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Downloads</p>
                        <p className="font-semibold">{((version.downloads_count || 0) / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                    {version.features && version.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {version.features.map((f, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-gray-600">Active Features</span><span className="font-semibold">{stats.activeFeatures}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Total Versions</span><span className="font-semibold">{stats.totalVersions}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Latest Version</span><span className="font-semibold">{stats.latestVersion || 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Avg Rating</span><span className="font-semibold">{stats.avgRating.toFixed(1)}/5</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Download Target</h3>
              <div className="mb-2 flex justify-between text-sm">
                <span>{((stats.totalDownloads || 0) / 1000).toFixed(0)}K</span>
                <span>500K</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full" style={{ width: `${Math.min((stats.totalDownloads / 500000) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {showFeatureModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">Add Feature</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={featureForm.title} onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={featureForm.description} onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Platform</label><select value={featureForm.platform} onChange={(e) => setFeatureForm({ ...featureForm, platform: e.target.value as 'all' | 'ios' | 'android' })} className="w-full px-3 py-2 border rounded-lg"><option value="all">All</option><option value="ios">iOS</option><option value="android">Android</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Type</label><select value={featureForm.feature_type} onChange={(e) => setFeatureForm({ ...featureForm, feature_type: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg"><option value="core">Core</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="beta">Beta</option></select></div>
                </div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowFeatureModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreateFeature} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}

        {showVersionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">New Version</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Version</label><input type="text" value={versionForm.version} onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="2.5.0" /></div>
                <div><label className="block text-sm font-medium mb-1">Platform</label><select value={versionForm.platform} onChange={(e) => setVersionForm({ ...versionForm, platform: e.target.value as any })} className="w-full px-3 py-2 border rounded-lg"><option value="all">All</option><option value="ios">iOS</option><option value="android">Android</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Release Notes</label><textarea value={versionForm.release_notes} onChange={(e) => setVersionForm({ ...versionForm, release_notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowVersionModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreateVersion} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
