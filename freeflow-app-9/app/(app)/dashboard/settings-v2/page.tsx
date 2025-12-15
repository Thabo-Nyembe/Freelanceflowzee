import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SettingsClient from './settings-client'

export const dynamic = 'force-dynamic'

function calculateProfileCompleteness(settings: any): number {
  if (!settings) return 0
  const fields = ['first_name', 'last_name', 'display_name', 'bio', 'avatar_url', 'timezone']
  const completed = fields.filter(f => settings[f]).length
  return Math.round((completed / fields.length) * 100)
}

function calculateSecurityScore(settings: any): number {
  if (!settings) return 50
  let score = 50
  if (settings.two_factor_enabled) score += 30
  if (settings.security_questions?.length > 0) score += 20
  return Math.min(score, 100)
}

function calculateAccountAge(createdAt: string): string {
  if (!createdAt) return '0 days'
  const created = new Date(createdAt)
  const now = new Date()
  const years = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365)
  if (years >= 1) return `${years.toFixed(1)} years`
  const months = years * 12
  if (months >= 1) return `${Math.round(months)} months`
  const days = years * 365
  return `${Math.round(days)} days`
}

export default async function SettingsV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let settings: any = null
  let stats = {
    profileCompleteness: 0,
    storageUsedGB: 0,
    storageLimitGB: 100,
    securityScore: 50,
    accountAge: '0 days'
  }

  if (user) {
    const { data: settingsData, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && settingsData) {
      settings = settingsData

      stats = {
        profileCompleteness: calculateProfileCompleteness(settings),
        storageUsedGB: Math.round((settings.storage_used_bytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
        storageLimitGB: Math.round((settings.storage_limit_bytes || 107374182400) / (1024 * 1024 * 1024)),
        securityScore: calculateSecurityScore(settings),
        accountAge: calculateAccountAge(settings.created_at)
      }
    }
  }

  return <SettingsClient initialSettings={settings} initialStats={stats} />
}
