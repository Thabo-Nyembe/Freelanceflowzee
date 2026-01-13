'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'not_applicable' | 'pending_review'
export type ComplianceFramework = 'gdpr' | 'hipaa' | 'soc2' | 'iso27001' | 'pci_dss' | 'ccpa' | 'custom'

export interface ComplianceRequirement {
  id: string
  framework: ComplianceFramework
  category: string
  code: string
  title: string
  description: string
  status: ComplianceStatus
  priority: 'critical' | 'high' | 'medium' | 'low'
  controls: ComplianceControl[]
  evidence: ComplianceEvidence[]
  owner: string
  ownerName: string
  dueDate?: string
  lastAssessedAt?: string
  nextAssessmentAt?: string
  notes: string
  remediationPlan?: string
  createdAt: string
  updatedAt: string
}

export interface ComplianceControl {
  id: string
  name: string
  description: string
  type: 'technical' | 'administrative' | 'physical'
  status: 'implemented' | 'partial' | 'planned' | 'not_implemented'
  implementationDetails?: string
  testResults?: string
  lastTestedAt?: string
}

export interface ComplianceEvidence {
  id: string
  name: string
  type: 'document' | 'screenshot' | 'log' | 'report' | 'certificate'
  url: string
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  expiresAt?: string
  notes?: string
}

export interface ComplianceAssessment {
  id: string
  name: string
  framework: ComplianceFramework
  type: 'internal' | 'external' | 'self'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  assessor?: string
  assessorOrg?: string
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  findings: AssessmentFinding[]
  overallScore?: number
  reportUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AssessmentFinding {
  id: string
  requirementId: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational'
  title: string
  description: string
  recommendation: string
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk'
  dueDate?: string
  resolvedAt?: string
}

export interface Policy {
  id: string
  name: string
  description: string
  category: string
  version: string
  status: 'draft' | 'published' | 'archived'
  content: string
  documentUrl?: string
  frameworks: ComplianceFramework[]
  owner: string
  ownerName: string
  approvedBy?: string
  approvedAt?: string
  effectiveDate?: string
  reviewDate?: string
  acknowledgments: PolicyAcknowledgment[]
  createdAt: string
  updatedAt: string
}

export interface PolicyAcknowledgment {
  userId: string
  userName: string
  acknowledgedAt: string
  version: string
}

export interface ComplianceStats {
  overallScore: number
  totalRequirements: number
  compliantCount: number
  nonCompliantCount: number
  partialCount: number
  pendingCount: number
  byFramework: { framework: ComplianceFramework; score: number; total: number }[]
  upcomingDeadlines: { id: string; title: string; dueDate: string }[]
  recentFindings: { id: string; title: string; severity: string }[]
  scoreTrend: { date: string; score: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockRequirements: ComplianceRequirement[] = [
  { id: 'req-1', framework: 'gdpr', category: 'Data Subject Rights', code: 'GDPR-15', title: 'Right of Access', description: 'Data subjects have the right to obtain confirmation as to whether their personal data is being processed.', status: 'compliant', priority: 'critical', controls: [{ id: 'ctrl-1', name: 'Data Access Portal', description: 'Self-service portal for data access requests', type: 'technical', status: 'implemented', lastTestedAt: '2024-03-01' }], evidence: [{ id: 'ev-1', name: 'Data Access Process Documentation', type: 'document', url: '/evidence/data-access-process.pdf', uploadedBy: 'user-1', uploadedByName: 'Alex Chen', uploadedAt: '2024-03-01' }], owner: 'user-1', ownerName: 'Alex Chen', lastAssessedAt: '2024-03-01', nextAssessmentAt: '2024-06-01', notes: '', createdAt: '2024-01-01', updatedAt: '2024-03-01' },
  { id: 'req-2', framework: 'soc2', category: 'Security', code: 'SOC2-CC6.1', title: 'Logical Access Controls', description: 'The entity implements logical access security software, infrastructure, and architectures.', status: 'partial', priority: 'high', controls: [{ id: 'ctrl-2', name: 'Role-Based Access Control', description: 'RBAC implementation across all systems', type: 'technical', status: 'implemented' }, { id: 'ctrl-3', name: 'Multi-Factor Authentication', description: 'MFA required for all user accounts', type: 'technical', status: 'partial' }], evidence: [], owner: 'user-2', ownerName: 'Sarah Miller', remediationPlan: 'Complete MFA rollout by Q2', dueDate: '2024-04-30', lastAssessedAt: '2024-02-15', notes: '', createdAt: '2024-01-01', updatedAt: '2024-03-10' },
  { id: 'req-3', framework: 'hipaa', category: 'Privacy', code: 'HIPAA-164.502', title: 'Uses and Disclosures', description: 'A covered entity may not use or disclose protected health information except as permitted.', status: 'compliant', priority: 'critical', controls: [{ id: 'ctrl-4', name: 'PHI Access Logging', description: 'All PHI access is logged and monitored', type: 'technical', status: 'implemented' }], evidence: [], owner: 'user-1', ownerName: 'Alex Chen', lastAssessedAt: '2024-03-05', notes: '', createdAt: '2024-01-01', updatedAt: '2024-03-05' }
]

const mockAssessments: ComplianceAssessment[] = [
  { id: 'assess-1', name: 'Annual SOC 2 Type II Audit', framework: 'soc2', type: 'external', status: 'scheduled', assessor: 'John Smith', assessorOrg: 'Big 4 Audit Firm', scheduledAt: '2024-04-15', findings: [], createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: 'assess-2', name: 'Q1 Internal GDPR Review', framework: 'gdpr', type: 'internal', status: 'completed', scheduledAt: '2024-03-01', startedAt: '2024-03-01', completedAt: '2024-03-10', findings: [{ id: 'find-1', requirementId: 'req-1', severity: 'low', title: 'Missing consent timestamp', description: 'Some consent records missing timestamp', recommendation: 'Add timestamp to all consent records', status: 'resolved', resolvedAt: '2024-03-15' }], overallScore: 92, reportUrl: '/reports/gdpr-q1-2024.pdf', createdAt: '2024-02-15', updatedAt: '2024-03-15' }
]

const mockPolicies: Policy[] = [
  { id: 'pol-1', name: 'Data Privacy Policy', description: 'Outlines how we collect, use, and protect personal data.', category: 'Privacy', version: '2.1', status: 'published', content: '# Data Privacy Policy\n\n...', documentUrl: '/policies/privacy-policy.pdf', frameworks: ['gdpr', 'ccpa'], owner: 'user-1', ownerName: 'Alex Chen', approvedBy: 'CEO', approvedAt: '2024-01-15', effectiveDate: '2024-02-01', reviewDate: '2025-02-01', acknowledgments: [{ userId: 'user-2', userName: 'Sarah Miller', acknowledgedAt: '2024-02-05', version: '2.1' }], createdAt: '2023-01-01', updatedAt: '2024-01-15' },
  { id: 'pol-2', name: 'Information Security Policy', description: 'Establishes information security requirements.', category: 'Security', version: '3.0', status: 'published', content: '# Information Security Policy\n\n...', frameworks: ['soc2', 'iso27001'], owner: 'user-2', ownerName: 'Sarah Miller', approvedBy: 'CTO', approvedAt: '2024-02-01', effectiveDate: '2024-02-15', reviewDate: '2025-02-15', acknowledgments: [], createdAt: '2022-06-01', updatedAt: '2024-02-01' }
]

const mockStats: ComplianceStats = {
  overallScore: 87,
  totalRequirements: 125,
  compliantCount: 98,
  nonCompliantCount: 8,
  partialCount: 15,
  pendingCount: 4,
  byFramework: [
    { framework: 'gdpr', score: 92, total: 45 },
    { framework: 'soc2', score: 85, total: 50 },
    { framework: 'hipaa', score: 88, total: 30 }
  ],
  upcomingDeadlines: [
    { id: 'req-2', title: 'MFA Rollout', dueDate: '2024-04-30' }
  ],
  recentFindings: [
    { id: 'find-1', title: 'Missing consent timestamp', severity: 'low' }
  ],
  scoreTrend: [
    { date: '2024-01', score: 82 },
    { date: '2024-02', score: 85 },
    { date: '2024-03', score: 87 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseComplianceOptions {
  
}

export function useCompliance(options: UseComplianceOptions = {}) {
  const {  } = options

  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [currentRequirement, setCurrentRequirement] = useState<ComplianceRequirement | null>(null)
  const [stats, setStats] = useState<ComplianceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCompliance = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/compliance')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch compliance data')
      }

      // Map API response to hook state
      if (result.items) {
        setRequirements(result.items.map((item: any) => ({
          id: item.id,
          framework: item.compliance_type || 'custom',
          category: item.category || 'General',
          code: item.code || '',
          title: item.title || item.name,
          description: item.description || '',
          status: item.status || 'pending_review',
          priority: item.priority || 'medium',
          controls: item.controls || [],
          evidence: item.evidence || [],
          owner: item.owner_id || '',
          ownerName: item.owner_name || '',
          dueDate: item.due_date,
          lastAssessedAt: item.last_assessed_at,
          nextAssessmentAt: item.next_assessment_at,
          notes: item.notes || '',
          remediationPlan: item.remediation_plan,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        })))
      }

      if (result.audits) {
        setAssessments(result.audits.map((audit: any) => ({
          id: audit.id,
          name: audit.name || audit.audit_name,
          framework: audit.framework || 'custom',
          type: audit.audit_type || 'internal',
          status: audit.status || 'scheduled',
          assessor: audit.assessor,
          assessorOrg: audit.assessor_org,
          scheduledAt: audit.scheduled_at || audit.audit_date,
          startedAt: audit.started_at,
          completedAt: audit.completed_at,
          findings: audit.findings || [],
          overallScore: audit.overall_score,
          reportUrl: audit.report_url,
          createdAt: audit.created_at,
          updatedAt: audit.updated_at
        })))
      }

      if (result.policies) {
        setPolicies(result.policies.map((policy: any) => ({
          id: policy.id,
          name: policy.name || policy.policy_name,
          description: policy.description || '',
          category: policy.category || 'General',
          version: policy.version || '1.0',
          status: policy.status || 'draft',
          content: policy.content || '',
          documentUrl: policy.document_url,
          frameworks: policy.frameworks || [],
          owner: policy.owner_id || '',
          ownerName: policy.owner_name || '',
          approvedBy: policy.approved_by,
          approvedAt: policy.approved_at,
          effectiveDate: policy.effective_date,
          reviewDate: policy.review_date,
          acknowledgments: policy.acknowledgments || [],
          createdAt: policy.created_at,
          updatedAt: policy.updated_at
        })))
      }

      if (result.stats) {
        setStats({
          overallScore: result.stats.complianceScore || 0,
          totalRequirements: result.stats.total || 0,
          compliantCount: result.stats.compliant || 0,
          nonCompliantCount: result.stats.nonCompliant || 0,
          partialCount: result.stats.pending || 0,
          pendingCount: result.stats.overdue || 0,
          byFramework: [],
          upcomingDeadlines: [],
          recentFindings: [],
          scoreTrend: []
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      // Use mock data as fallback
      setRequirements(mockRequirements)
      setAssessments(mockAssessments)
      setPolicies(mockPolicies)
      setStats(mockStats)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addEvidence = useCallback(async (reqId: string, evidence: Omit<ComplianceEvidence, 'id'>) => {
    const newEvidence: ComplianceEvidence = { id: `ev-${Date.now()}`, ...evidence }
    setRequirements(prev => prev.map(r => r.id === reqId ? {
      ...r,
      evidence: [...r.evidence, newEvidence],
      updatedAt: new Date().toISOString()
    } : r))
    return { success: true, evidence: newEvidence }
  }, [])

  const removeEvidence = useCallback(async (reqId: string, evidenceId: string) => {
    setRequirements(prev => prev.map(r => r.id === reqId ? {
      ...r,
      evidence: r.evidence.filter(e => e.id !== evidenceId)
    } : r))
    return { success: true }
  }, [])

  const updateControlStatus = useCallback(async (reqId: string, controlId: string, status: ComplianceControl['status']) => {
    setRequirements(prev => prev.map(r => r.id === reqId ? {
      ...r,
      controls: r.controls.map(c => c.id === controlId ? { ...c, status, lastTestedAt: new Date().toISOString() } : c),
      updatedAt: new Date().toISOString()
    } : r))
    return { success: true }
  }, [])

  const createAssessment = useCallback(async (data: Partial<ComplianceAssessment>) => {
    const assessment: ComplianceAssessment = {
      id: `assess-${Date.now()}`,
      name: data.name || '',
      framework: data.framework || 'custom',
      type: data.type || 'internal',
      status: 'scheduled',
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      findings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as ComplianceAssessment
    setAssessments(prev => [assessment, ...prev])
    return { success: true, assessment }
  }, [])

  const startAssessment = useCallback(async (assessmentId: string) => {
    setAssessments(prev => prev.map(a => a.id === assessmentId ? {
      ...a,
      status: 'in_progress' as const,
      startedAt: new Date().toISOString()
    } : a))
    return { success: true }
  }, [])

  const completeAssessment = useCallback(async (assessmentId: string, score: number, reportUrl?: string) => {
    setAssessments(prev => prev.map(a => a.id === assessmentId ? {
      ...a,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      overallScore: score,
      reportUrl
    } : a))
    return { success: true }
  }, [])

  const addFinding = useCallback(async (assessmentId: string, finding: Omit<AssessmentFinding, 'id'>) => {
    const newFinding: AssessmentFinding = { id: `find-${Date.now()}`, ...finding }
    setAssessments(prev => prev.map(a => a.id === assessmentId ? {
      ...a,
      findings: [...a.findings, newFinding]
    } : a))
    return { success: true, finding: newFinding }
  }, [])

  const updateFindingStatus = useCallback(async (assessmentId: string, findingId: string, status: AssessmentFinding['status']) => {
    setAssessments(prev => prev.map(a => a.id === assessmentId ? {
      ...a,
      findings: a.findings.map(f => f.id === findingId ? {
        ...f,
        status,
        resolvedAt: status === 'resolved' ? new Date().toISOString() : f.resolvedAt
      } : f)
    } : a))
    return { success: true }
  }, [])

  const createPolicy = useCallback(async (data: Partial<Policy>) => {
    const policy: Policy = {
      id: `pol-${Date.now()}`,
      name: data.name || '',
      description: data.description || '',
      category: data.category || 'General',
      version: '1.0',
      status: 'draft',
      content: data.content || '',
      frameworks: data.frameworks || [],
      owner: 'user-1',
      ownerName: 'You',
      acknowledgments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as Policy
    setPolicies(prev => [policy, ...prev])
    return { success: true, policy }
  }, [])

  const publishPolicy = useCallback(async (policyId: string) => {
    setPolicies(prev => prev.map(p => p.id === policyId ? {
      ...p,
      status: 'published' as const,
      effectiveDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : p))
    return { success: true }
  }, [])

  const acknowledgePolicy = useCallback(async (policyId: string) => {
    const policy = policies.find(p => p.id === policyId)
    if (!policy) return { success: false }

    const acknowledgment: PolicyAcknowledgment = {
      userId: 'user-1',
      userName: 'You',
      acknowledgedAt: new Date().toISOString(),
      version: policy.version
    }

    setPolicies(prev => prev.map(p => p.id === policyId ? {
      ...p,
      acknowledgments: [...p.acknowledgments.filter(a => a.userId !== 'user-1'), acknowledgment]
    } : p))
    return { success: true }
  }, [policies])

  const getRequirementsByFramework = useCallback((framework: ComplianceFramework) => {
    return requirements.filter(r => r.framework === framework)
  }, [requirements])

  const getStatusColor = useCallback((status: ComplianceStatus): string => {
    switch (status) {
      case 'compliant': return '#22c55e'
      case 'non_compliant': return '#ef4444'
      case 'partial': return '#f59e0b'
      case 'not_applicable': return '#6b7280'
      case 'pending_review': return '#3b82f6'
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchCompliance()
  }, [fetchCompliance])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const compliantRequirements = useMemo(() => requirements.filter(r => r.status === 'compliant'), [requirements])
  const nonCompliantRequirements = useMemo(() => requirements.filter(r => r.status === 'non_compliant'), [requirements])
  const upcomingAssessments = useMemo(() => assessments.filter(a => a.status === 'scheduled').sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()), [assessments])
  const openFindings = useMemo(() => assessments.flatMap(a => a.findings.filter(f => f.status === 'open')), [assessments])
  const publishedPolicies = useMemo(() => policies.filter(p => p.status === 'published'), [policies])
  const policiesNeedingReview = useMemo(() => policies.filter(p => p.reviewDate && new Date(p.reviewDate) < new Date()), [policies])

  return {
    requirements, assessments, policies, currentRequirement, stats,
    compliantRequirements, nonCompliantRequirements, upcomingAssessments, openFindings,
    publishedPolicies, policiesNeedingReview,
    isLoading, error,
    refresh, updateRequirementStatus, addEvidence, removeEvidence, updateControlStatus,
    createAssessment, startAssessment, completeAssessment, addFinding, updateFindingStatus,
    createPolicy, publishPolicy, acknowledgePolicy,
    getRequirementsByFramework, getStatusColor, setCurrentRequirement
  }
}

export default useCompliance
