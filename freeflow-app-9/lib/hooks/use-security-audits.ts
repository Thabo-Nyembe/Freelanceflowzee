'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface SecurityAudit {
  id: string
  user_id: string
  audit_code: string
  name: string
  description: string | null
  audit_type: 'access-control' | 'data-encryption' | 'compliance' | 'penetration-test' | 'code-review' | 'infrastructure'
  status: 'scheduled' | 'in-progress' | 'passed' | 'failed' | 'warning' | 'cancelled'
  severity: 'low' | 'medium' | 'high' | 'critical'
  compliance_standards: string[]
  audited_by: string | null
  auditor_email: string | null
  started_at: string | null
  completed_at: string | null
  duration_seconds: number
  findings_critical: number
  findings_high: number
  findings_medium: number
  findings_low: number
  total_recommendations: number
  remediated_count: number
  security_score: number | null
  report_url: string | null
  schedule_cron: string | null
  next_scheduled_at: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AuditFinding {
  id: string
  audit_id: string
  finding_code: string | null
  title: string
  description: string | null
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  category: string | null
  affected_resource: string | null
  evidence: string | null
  recommendation: string | null
  status: 'open' | 'in-progress' | 'remediated' | 'accepted' | 'false-positive'
  remediated_at: string | null
  remediated_by: string | null
  cve_id: string | null
  cvss_score: number | null
  compliance_impact: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AuditStats {
  total: number
  scheduled: number
  inProgress: number
  passed: number
  failed: number
  warning: number
  totalFindings: number
  avgScore: number
  remediationRate: number
}

export function useSecurityAudits() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [audits, setAudits] = useState<SecurityAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('security_audits')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAudits(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch audits', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const createAudit = async (audit: Partial<SecurityAudit>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('security_audits')
        .insert([{ ...audit, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setAudits(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Audit scheduled successfully' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updateAudit = async (id: string, updates: Partial<SecurityAudit>) => {
    try {
      const { data, error } = await supabase
        .from('security_audits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setAudits(prev => prev.map(a => a.id === id ? data : a))
      toast({ title: 'Success', description: 'Audit updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const deleteAudit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('security_audits')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setAudits(prev => prev.filter(a => a.id !== id))
      toast({ title: 'Success', description: 'Audit deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const startAudit = async (id: string) => {
    return updateAudit(id, {
      status: 'in-progress',
      started_at: new Date().toISOString()
    })
  }

  const completeAudit = async (id: string, status: 'passed' | 'failed' | 'warning', score?: number) => {
    const audit = audits.find(a => a.id === id)
    const startedAt = audit?.started_at ? new Date(audit.started_at) : new Date()
    const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000)

    return updateAudit(id, {
      status,
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      security_score: score
    })
  }

  const cancelAudit = async (id: string) => {
    return updateAudit(id, { status: 'cancelled' })
  }

  const getStats = useCallback((): AuditStats => {
    const withScores = audits.filter(a => a.security_score !== null)
    const totalFindings = audits.reduce((sum, a) =>
      sum + a.findings_critical + a.findings_high + a.findings_medium + a.findings_low, 0
    )
    const totalRemediated = audits.reduce((sum, a) => sum + a.remediated_count, 0)
    const totalRecommendations = audits.reduce((sum, a) => sum + a.total_recommendations, 0)

    return {
      total: audits.length,
      scheduled: audits.filter(a => a.status === 'scheduled').length,
      inProgress: audits.filter(a => a.status === 'in-progress').length,
      passed: audits.filter(a => a.status === 'passed').length,
      failed: audits.filter(a => a.status === 'failed').length,
      warning: audits.filter(a => a.status === 'warning').length,
      totalFindings,
      avgScore: withScores.length > 0
        ? withScores.reduce((sum, a) => sum + (a.security_score || 0), 0) / withScores.length
        : 0,
      remediationRate: totalRecommendations > 0
        ? (totalRemediated / totalRecommendations) * 100
        : 0
    }
  }, [audits])

  useEffect(() => {
    fetchAudits()

    const channel = supabase
      .channel('security-audits-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'security_audits' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAudits(prev => [payload.new as SecurityAudit, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setAudits(prev => prev.map(a => a.id === payload.new.id ? payload.new as SecurityAudit : a))
        } else if (payload.eventType === 'DELETE') {
          setAudits(prev => prev.filter(a => a.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAudits, supabase])

  return {
    audits,
    loading,
    error,
    fetchAudits,
    createAudit,
    updateAudit,
    deleteAudit,
    startAudit,
    completeAudit,
    cancelAudit,
    getStats
  }
}

// Hook for audit findings
export function useAuditFindings(auditId: string) {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [findings, setFindings] = useState<AuditFinding[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFindings = useCallback(async () => {
    if (!auditId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('audit_findings')
        .select('*')
        .eq('audit_id', auditId)
        .order('severity', { ascending: false })

      if (error) throw error
      setFindings(data || [])
    } catch (err) {
      console.error('Failed to fetch findings:', err)
    } finally {
      setLoading(false)
    }
  }, [auditId, supabase])

  const addFinding = async (finding: Partial<AuditFinding>) => {
    try {
      const { data, error } = await supabase
        .from('audit_findings')
        .insert([{ ...finding, audit_id: auditId }])
        .select()
        .single()

      if (error) throw error
      setFindings(prev => [...prev, data])
      toast({ title: 'Success', description: 'Finding added' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updateFinding = async (id: string, updates: Partial<AuditFinding>) => {
    try {
      const { data, error } = await supabase
        .from('audit_findings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setFindings(prev => prev.map(f => f.id === id ? data : f))
      toast({ title: 'Success', description: 'Finding updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const remediateFinding = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    return updateFinding(id, {
      status: 'remediated',
      remediated_at: new Date().toISOString(),
      remediated_by: user?.id
    })
  }

  useEffect(() => {
    fetchFindings()

    if (auditId) {
      const channel = supabase
        .channel(`audit-findings-${auditId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'audit_findings',
          filter: `audit_id=eq.${auditId}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setFindings(prev => [...prev, payload.new as AuditFinding])
          } else if (payload.eventType === 'UPDATE') {
            setFindings(prev => prev.map(f => f.id === payload.new.id ? payload.new as AuditFinding : f))
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchFindings, auditId, supabase])

  return { findings, loading, addFinding, updateFinding, remediateFinding }
}
