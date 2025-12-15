'use client'
import { useState } from 'react'
import { useAdminSettings, type AdminSetting, type SettingScope } from '@/lib/hooks/use-admin-settings'

export default function AdminClient({ initialSettings }: { initialSettings: AdminSetting[] }) {
  const [scopeFilter, setScopeFilter] = useState<SettingScope | 'all'>('all')
  const { settings, loading, error } = useAdminSettings({ scope: scopeFilter })
  const displaySettings = settings.length > 0 ? settings : initialSettings

  const stats = {
    total: displaySettings.length,
    active: displaySettings.filter(s => s.status === 'active').length,
    global: displaySettings.filter(s => s.scope === 'global').length,
    encrypted: displaySettings.filter(s => s.is_encrypted).length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">Admin Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Settings</div><div className="text-3xl font-bold text-slate-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.active}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Global</div><div className="text-3xl font-bold text-blue-600">{stats.global}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Encrypted</div><div className="text-3xl font-bold text-purple-600">{stats.encrypted}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Scopes</option><option value="global">Global</option><option value="organization">Organization</option><option value="team">Team</option><option value="user">User</option>
          </select>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displaySettings.filter(s => scopeFilter === 'all' || s.scope === scopeFilter).map(setting => (
          <div key={setting.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${setting.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{setting.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{setting.scope}</span>
                  {setting.is_encrypted && <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">Encrypted</span>}
                  {setting.is_required && <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">Required</span>}
                </div>
                <h3 className="text-lg font-semibold">{setting.setting_name}</h3>
                <p className="text-sm text-gray-600 mt-1">{setting.setting_category} • {setting.value_type}</p>
                {setting.description && <p className="text-sm text-gray-600 mt-2">{setting.description}</p>}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{setting.setting_key}</div>
                <div className="text-xs text-gray-500 mt-1">v{setting.version}</div>
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
