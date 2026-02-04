import { NextRequest, NextResponse } from 'next/server';
import { createFeatureLogger } from '@/lib/logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('enterprise-soc2-compliance');

// Phase 8 Gap #1: SOC 2 Type II Compliance
// Priority: HIGH | Competitor: Enterprise platforms
// Features: Trust Service Criteria, continuous monitoring, evidence collection,
// audit reports, control assessments, vendor risk management

interface SOC2Control {
  id: string;
  category: TrustServiceCategory;
  controlId: string;
  title: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partially-compliant' | 'not-applicable';
  lastAssessed: string;
  nextAssessment: string;
  evidence: ControlEvidence[];
  findings: ControlFinding[];
  owner: string;
  implementationDetails: string;
  testingProcedure: string;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

type TrustServiceCategory = 'security' | 'availability' | 'processing-integrity' | 'confidentiality' | 'privacy';

interface ControlEvidence {
  id: string;
  type: 'screenshot' | 'document' | 'log' | 'policy' | 'configuration' | 'report';
  name: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
  fileUrl: string;
  expiresAt?: string;
}

interface ControlFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  status: 'open' | 'in-progress' | 'remediated' | 'accepted';
  identifiedAt: string;
  remediationPlan: string;
  dueDate: string;
  assignee: string;
  remediatedAt?: string;
}

interface ComplianceReport {
  id: string;
  type: 'soc2-type1' | 'soc2-type2' | 'gap-assessment' | 'readiness';
  period: { start: string; end: string };
  status: 'draft' | 'in-review' | 'final';
  auditor?: string;
  findings: number;
  criticalFindings: number;
  overallStatus: 'compliant' | 'non-compliant' | 'qualified';
  categories: CategorySummary[];
  generatedAt: string;
  downloadUrl?: string;
}

interface CategorySummary {
  category: TrustServiceCategory;
  totalControls: number;
  compliantControls: number;
  complianceRate: number;
  criticalFindings: number;
}

interface ContinuousMonitoring {
  id: string;
  name: string;
  type: 'automated' | 'manual';
  frequency: string;
  lastRun: string;
  nextRun: string;
  status: 'passing' | 'failing' | 'warning';
  controlsMonitored: string[];
  alerts: MonitoringAlert[];
}

interface MonitoringAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

// Demo data - SOC 2 Type II compliance
const demoControls: SOC2Control[] = [
  {
    id: 'ctrl-001',
    category: 'security',
    controlId: 'CC6.1',
    title: 'Logical Access Security',
    description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.',
    status: 'compliant',
    lastAssessed: '2025-01-10',
    nextAssessment: '2025-04-10',
    evidence: [
      { id: 'ev-1', type: 'configuration', name: 'IAM Policy Configuration', description: 'AWS IAM policies and role assignments', uploadedAt: '2025-01-10', uploadedBy: 'Security Team', fileUrl: '/evidence/iam-config.pdf' },
      { id: 'ev-2', type: 'log', name: 'Access Control Logs', description: 'Last 90 days of access control audit logs', uploadedAt: '2025-01-10', uploadedBy: 'System', fileUrl: '/evidence/access-logs.csv' }
    ],
    findings: [],
    owner: 'Security Team',
    implementationDetails: 'Role-based access control with MFA, automated provisioning/deprovisioning, quarterly access reviews',
    testingProcedure: 'Review IAM configurations, test access controls, verify MFA enforcement, audit privileged access',
    frequency: 'quarterly'
  },
  {
    id: 'ctrl-002',
    category: 'security',
    controlId: 'CC6.2',
    title: 'User Authentication',
    description: 'Prior to issuing system credentials and granting access, the entity registers and authorizes new internal and external users.',
    status: 'compliant',
    lastAssessed: '2025-01-10',
    nextAssessment: '2025-04-10',
    evidence: [
      { id: 'ev-3', type: 'policy', name: 'User Provisioning Policy', description: 'Documented user provisioning and authentication policy', uploadedAt: '2025-01-05', uploadedBy: 'HR', fileUrl: '/evidence/provisioning-policy.pdf' }
    ],
    findings: [],
    owner: 'IT Team',
    implementationDetails: 'SSO integration, MFA required for all users, password complexity requirements, session management',
    testingProcedure: 'Test user provisioning workflow, verify MFA enforcement, review authentication logs',
    frequency: 'quarterly'
  },
  {
    id: 'ctrl-003',
    category: 'availability',
    controlId: 'A1.2',
    title: 'System Availability',
    description: 'The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections.',
    status: 'compliant',
    lastAssessed: '2025-01-08',
    nextAssessment: '2025-04-08',
    evidence: [
      { id: 'ev-4', type: 'report', name: 'Uptime Report Q4 2024', description: '99.95% uptime achieved', uploadedAt: '2025-01-05', uploadedBy: 'DevOps', fileUrl: '/evidence/uptime-q4.pdf' }
    ],
    findings: [],
    owner: 'DevOps Team',
    implementationDetails: 'Multi-region deployment, auto-scaling, health monitoring, incident response procedures',
    testingProcedure: 'Review uptime metrics, test failover procedures, verify monitoring alerts',
    frequency: 'monthly'
  },
  {
    id: 'ctrl-004',
    category: 'confidentiality',
    controlId: 'C1.1',
    title: 'Data Encryption',
    description: 'The entity protects confidential information during transmission and at rest.',
    status: 'compliant',
    lastAssessed: '2025-01-12',
    nextAssessment: '2025-04-12',
    evidence: [
      { id: 'ev-5', type: 'configuration', name: 'Encryption Standards', description: 'TLS 1.3 and AES-256 encryption configurations', uploadedAt: '2025-01-12', uploadedBy: 'Security Team', fileUrl: '/evidence/encryption-config.pdf' }
    ],
    findings: [],
    owner: 'Security Team',
    implementationDetails: 'TLS 1.3 for transit, AES-256 for rest, key rotation every 90 days, HSM for key storage',
    testingProcedure: 'SSL Labs scan, encryption verification, key management audit',
    frequency: 'quarterly'
  },
  {
    id: 'ctrl-005',
    category: 'privacy',
    controlId: 'P6.1',
    title: 'Data Retention',
    description: 'Personal information is retained only for as long as necessary to fulfill the stated purposes.',
    status: 'partially-compliant',
    lastAssessed: '2025-01-05',
    nextAssessment: '2025-02-05',
    evidence: [
      { id: 'ev-6', type: 'policy', name: 'Data Retention Policy', description: 'Documented retention schedules', uploadedAt: '2025-01-05', uploadedBy: 'Legal', fileUrl: '/evidence/retention-policy.pdf' }
    ],
    findings: [
      { id: 'find-1', severity: 'medium', description: 'Automated deletion not fully implemented for all data types', status: 'in-progress', identifiedAt: '2025-01-05', remediationPlan: 'Implement automated data lifecycle management', dueDate: '2025-02-28', assignee: 'Engineering' }
    ],
    owner: 'Legal Team',
    implementationDetails: 'Retention schedules defined, manual deletion process in place, automation in progress',
    testingProcedure: 'Review retention schedules, verify deletion procedures, audit data age',
    frequency: 'quarterly'
  }
];

const demoMonitoring: ContinuousMonitoring[] = [
  {
    id: 'mon-001',
    name: 'Access Control Monitor',
    type: 'automated',
    frequency: 'continuous',
    lastRun: '2025-01-15T14:30:00Z',
    nextRun: '2025-01-15T14:35:00Z',
    status: 'passing',
    controlsMonitored: ['CC6.1', 'CC6.2', 'CC6.3'],
    alerts: []
  },
  {
    id: 'mon-002',
    name: 'Encryption Verification',
    type: 'automated',
    frequency: 'daily',
    lastRun: '2025-01-15T00:00:00Z',
    nextRun: '2025-01-16T00:00:00Z',
    status: 'passing',
    controlsMonitored: ['C1.1', 'C1.2'],
    alerts: []
  },
  {
    id: 'mon-003',
    name: 'Availability Monitor',
    type: 'automated',
    frequency: 'continuous',
    lastRun: '2025-01-15T14:30:00Z',
    nextRun: '2025-01-15T14:31:00Z',
    status: 'passing',
    controlsMonitored: ['A1.1', 'A1.2'],
    alerts: []
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      // Controls Management
      case 'get-controls':
        const filteredControls = params.category
          ? demoControls.filter(c => c.category === params.category)
          : demoControls;

        return NextResponse.json({
          success: true,
          data: {
            controls: filteredControls,
            summary: {
              total: filteredControls.length,
              compliant: filteredControls.filter(c => c.status === 'compliant').length,
              nonCompliant: filteredControls.filter(c => c.status === 'non-compliant').length,
              partiallyCompliant: filteredControls.filter(c => c.status === 'partially-compliant').length,
              complianceRate: Math.round((filteredControls.filter(c => c.status === 'compliant').length / filteredControls.length) * 100)
            }
          }
        });

      case 'get-control':
        const control = demoControls.find(c => c.id === params.controlId);
        return NextResponse.json({ success: true, data: { control } });

      case 'update-control-status':
        return NextResponse.json({
          success: true,
          data: {
            controlId: params.controlId,
            previousStatus: 'partially-compliant',
            newStatus: params.status,
            updatedAt: new Date().toISOString(),
            updatedBy: params.updatedBy || 'System'
          }
        });

      case 'add-evidence':
        const evidence: ControlEvidence = {
          id: `ev-${Date.now()}`,
          type: params.type,
          name: params.name,
          description: params.description || '',
          uploadedAt: new Date().toISOString(),
          uploadedBy: params.uploadedBy || 'User',
          fileUrl: params.fileUrl
        };
        return NextResponse.json({ success: true, data: { evidence } });

      case 'add-finding':
        const finding: ControlFinding = {
          id: `find-${Date.now()}`,
          severity: params.severity,
          description: params.description,
          status: 'open',
          identifiedAt: new Date().toISOString(),
          remediationPlan: params.remediationPlan || '',
          dueDate: params.dueDate,
          assignee: params.assignee
        };
        return NextResponse.json({ success: true, data: { finding } });

      // Compliance Reports
      case 'generate-report':
        const report: ComplianceReport = {
          id: `report-${Date.now()}`,
          type: params.type || 'soc2-type2',
          period: params.period || { start: '2024-01-01', end: '2024-12-31' },
          status: 'draft',
          findings: demoControls.reduce((sum, c) => sum + c.findings.length, 0),
          criticalFindings: demoControls.reduce((sum, c) => sum + c.findings.filter(f => f.severity === 'critical').length, 0),
          overallStatus: 'compliant',
          categories: [
            { category: 'security', totalControls: 15, compliantControls: 14, complianceRate: 93, criticalFindings: 0 },
            { category: 'availability', totalControls: 8, compliantControls: 8, complianceRate: 100, criticalFindings: 0 },
            { category: 'processing-integrity', totalControls: 6, compliantControls: 6, complianceRate: 100, criticalFindings: 0 },
            { category: 'confidentiality', totalControls: 10, compliantControls: 9, complianceRate: 90, criticalFindings: 0 },
            { category: 'privacy', totalControls: 12, compliantControls: 10, complianceRate: 83, criticalFindings: 0 }
          ],
          generatedAt: new Date().toISOString()
        };
        return NextResponse.json({ success: true, data: { report } });

      case 'get-reports':
        return NextResponse.json({
          success: true,
          data: {
            reports: [
              { id: 'report-001', type: 'soc2-type2', period: { start: '2024-01-01', end: '2024-12-31' }, status: 'final', overallStatus: 'compliant', generatedAt: '2025-01-15' },
              { id: 'report-002', type: 'gap-assessment', period: { start: '2025-01-01', end: '2025-01-15' }, status: 'draft', overallStatus: 'compliant', generatedAt: '2025-01-15' }
            ]
          }
        });

      // Continuous Monitoring
      case 'get-monitoring':
        return NextResponse.json({
          success: true,
          data: {
            monitors: demoMonitoring,
            summary: {
              total: demoMonitoring.length,
              passing: demoMonitoring.filter(m => m.status === 'passing').length,
              failing: demoMonitoring.filter(m => m.status === 'failing').length,
              warning: demoMonitoring.filter(m => m.status === 'warning').length
            }
          }
        });

      case 'run-assessment':
        return NextResponse.json({
          success: true,
          data: {
            assessmentId: `assess-${Date.now()}`,
            controlsAssessed: params.controlIds?.length || demoControls.length,
            results: {
              passed: Math.floor((params.controlIds?.length || demoControls.length) * 0.92),
              failed: Math.floor((params.controlIds?.length || demoControls.length) * 0.05),
              needsReview: Math.floor((params.controlIds?.length || demoControls.length) * 0.03)
            },
            completedAt: new Date().toISOString()
          }
        });

      // Trust Service Categories Dashboard
      case 'get-dashboard':
        return NextResponse.json({
          success: true,
          data: {
            overallCompliance: 94,
            categories: [
              { category: 'security', compliance: 93, trend: 'stable', controls: 15, findings: 1 },
              { category: 'availability', compliance: 100, trend: 'up', controls: 8, findings: 0 },
              { category: 'processing-integrity', compliance: 100, trend: 'stable', controls: 6, findings: 0 },
              { category: 'confidentiality', compliance: 90, trend: 'up', controls: 10, findings: 1 },
              { category: 'privacy', compliance: 83, trend: 'up', controls: 12, findings: 2 }
            ],
            upcomingAssessments: [
              { controlId: 'CC6.1', dueDate: '2025-04-10', owner: 'Security Team' },
              { controlId: 'A1.2', dueDate: '2025-04-08', owner: 'DevOps Team' }
            ],
            recentFindings: demoControls.flatMap(c => c.findings).slice(0, 5),
            auditReadiness: {
              score: 92,
              evidenceComplete: 87,
              controlsDocumented: 96,
              testingComplete: 89
            }
          }
        });

      // Vendor Risk Management
      case 'get-vendors':
        return NextResponse.json({
          success: true,
          data: {
            vendors: [
              { id: 'v1', name: 'AWS', category: 'Cloud Provider', riskLevel: 'low', soc2Certified: true, lastAssessed: '2024-12-01', nextReview: '2025-06-01' },
              { id: 'v2', name: 'Stripe', category: 'Payment Processor', riskLevel: 'low', soc2Certified: true, lastAssessed: '2024-11-15', nextReview: '2025-05-15' },
              { id: 'v3', name: 'Supabase', category: 'Database', riskLevel: 'low', soc2Certified: true, lastAssessed: '2024-10-01', nextReview: '2025-04-01' }
            ]
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('SOC 2 Compliance API error', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      controls: demoControls,
      monitoring: demoMonitoring,
      features: [
        'Trust Service Criteria management',
        'Continuous compliance monitoring',
        'Evidence collection & storage',
        'Finding tracking & remediation',
        'Audit report generation',
        'Vendor risk management',
        'Control testing workflows',
        'Readiness assessments',
        'Gap analysis',
        'Auditor collaboration'
      ]
    }
  });
}
