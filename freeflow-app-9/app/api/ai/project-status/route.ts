/**
 * AI Project Status Reports API
 *
 * Competitive Gap Closure: Matches Asana Intelligence for AI-generated project insights
 *
 * Features:
 * - AI-generated executive summaries
 * - Risk assessment and blockers identification
 * - Progress analysis with recommendations
 * - Team performance insights
 * - Milestone prediction and timeline analysis
 * - Automated weekly/monthly reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// ============================================================================
// TYPES
// ============================================================================

interface ProjectStatusRequest {
  action: 'generate-report' | 'analyze-risks' | 'predict-timeline' | 'team-insights' | 'recommendations'
  projectId: string
  reportType?: 'executive' | 'detailed' | 'weekly' | 'monthly'
  includeTeamMetrics?: boolean
  includeMilestones?: boolean
  includeRisks?: boolean
  dateRange?: { start: string; end: string }
}

interface ProjectData {
  id: string
  title: string
  description?: string
  status: string
  start_date?: string
  end_date?: string
  budget?: number
  spent?: number
  tasks?: TaskData[]
  milestones?: MilestoneData[]
  team_members?: TeamMemberData[]
  time_entries?: TimeEntryData[]
}

interface TaskData {
  id: string
  title: string
  status: string
  priority: string
  assignee_id?: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  dependencies?: string[]
  blockers?: string[]
}

interface MilestoneData {
  id: string
  title: string
  due_date: string
  status: 'pending' | 'completed' | 'overdue'
  payment_percentage?: number
}

interface TeamMemberData {
  id: string
  name: string
  role: string
  tasks_completed: number
  tasks_in_progress: number
  utilization: number
}

interface TimeEntryData {
  task_id: string
  hours: number
  billable: boolean
  date: string
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ============================================================================
// OPENAI CLIENT
// ============================================================================

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'demo-key'
  })
}

// ============================================================================
// HELPER: Fetch Project Data
// ============================================================================

async function fetchProjectData(projectId: string): Promise<ProjectData | null> {
  const supabase = getSupabase()

  // Fetch project with related data
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      id, title, description, status, start_date, end_date, budget,
      tasks(id, title, status, priority, assignee_id, due_date, estimated_minutes, actual_minutes, dependencies, blockers),
      milestones(id, title, due_date, status, payment_percentage)
    `)
    .eq('id', projectId)
    .single()

  if (error || !project) {
    return null
  }

  // Fetch team members assigned to project tasks
  const assigneeIds = [...new Set((project.tasks || []).map((t: any) => t.assignee_id).filter(Boolean))]

  let teamMembers: TeamMemberData[] = []
  if (assigneeIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, role')
      .in('id', assigneeIds)

    if (users) {
      teamMembers = users.map((u: any) => ({
        id: u.id,
        name: u.name || 'Unknown',
        role: u.role || 'Member',
        tasks_completed: (project.tasks || []).filter((t: any) => t.assignee_id === u.id && t.status === 'completed').length,
        tasks_in_progress: (project.tasks || []).filter((t: any) => t.assignee_id === u.id && t.status === 'in_progress').length,
        utilization: 0
      }))
    }
  }

  // Fetch time entries
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('task_id, duration_minutes, is_billable, date')
    .eq('project_id', projectId)

  return {
    ...project,
    tasks: (project.tasks || []).map((t: any) => ({
      ...t,
      estimated_hours: (t.estimated_minutes || 0) / 60,
      actual_hours: (t.actual_minutes || 0) / 60
    })),
    milestones: project.milestones || [],
    team_members: teamMembers,
    time_entries: (timeEntries || []).map((te: any) => ({
      task_id: te.task_id,
      hours: (te.duration_minutes || 0) / 60,
      billable: te.is_billable,
      date: te.date
    }))
  }
}

// ============================================================================
// HELPER: Calculate Project Metrics
// ============================================================================

function calculateProjectMetrics(project: ProjectData) {
  const tasks = project.tasks || []
  const milestones = project.milestones || []
  const timeEntries = project.time_entries || []

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const blockedTasks = tasks.filter(t => t.status === 'blocked' || (t.blockers && t.blockers.length > 0)).length
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0)
  const totalBillableHours = timeEntries.filter(te => te.billable).reduce((sum, te) => sum + te.hours, 0)

  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const overdueMilestones = milestones.filter(m => m.status === 'overdue').length

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const budgetUsed = project.budget ? Math.round(((project.spent || 0) / project.budget) * 100) : 0

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    overdueTasks,
    totalEstimatedHours,
    totalActualHours,
    totalBillableHours,
    hoursVariance: totalActualHours - totalEstimatedHours,
    completedMilestones,
    overdueMilestones,
    totalMilestones: milestones.length,
    progressPercentage,
    budgetUsed,
    teamSize: project.team_members?.length || 0
  }
}

// ============================================================================
// HELPER: Generate AI Report
// ============================================================================

async function generateAIReport(project: ProjectData, metrics: ReturnType<typeof calculateProjectMetrics>, reportType: string) {
  const isDemo = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key'

  if (isDemo) {
    return generateDemoReport(project, metrics, reportType)
  }

  const openai = getOpenAI()

  const systemPrompt = `You are an expert project manager AI assistant. Generate insightful, actionable project status reports.
Focus on:
- Clear executive summaries
- Risk identification and mitigation strategies
- Team performance analysis
- Timeline and budget insights
- Specific recommendations with priorities
Be concise but thorough. Use professional language suitable for stakeholders.`

  const projectContext = `
Project: ${project.title}
Description: ${project.description || 'N/A'}
Status: ${project.status}
Timeline: ${project.start_date || 'Not set'} to ${project.end_date || 'Not set'}

Current Metrics:
- Progress: ${metrics.progressPercentage}% complete (${metrics.completedTasks}/${metrics.totalTasks} tasks)
- In Progress: ${metrics.inProgressTasks} tasks
- Blocked: ${metrics.blockedTasks} tasks
- Overdue: ${metrics.overdueTasks} tasks
- Hours: ${metrics.totalActualHours.toFixed(1)} actual vs ${metrics.totalEstimatedHours.toFixed(1)} estimated (${metrics.hoursVariance >= 0 ? '+' : ''}${metrics.hoursVariance.toFixed(1)} variance)
- Budget: ${metrics.budgetUsed}% used
- Milestones: ${metrics.completedMilestones}/${metrics.totalMilestones} completed, ${metrics.overdueMilestones} overdue
- Team Size: ${metrics.teamSize} members

Tasks with blockers:
${(project.tasks || []).filter(t => t.blockers && t.blockers.length > 0).map(t => `- ${t.title}: ${t.blockers?.join(', ')}`).join('\n') || 'None'}

Upcoming milestones:
${(project.milestones || []).filter(m => m.status === 'pending').map(m => `- ${m.title}: Due ${m.due_date}`).join('\n') || 'None'}
`

  const userPrompt = reportType === 'executive'
    ? `Generate a concise executive summary (3-4 paragraphs) covering overall health, key risks, and top 3 recommendations.`
    : reportType === 'detailed'
    ? `Generate a detailed project status report with sections: Executive Summary, Progress Analysis, Risk Assessment, Team Performance, Timeline Analysis, Budget Status, and Recommendations.`
    : reportType === 'weekly'
    ? `Generate a weekly status update highlighting: What was accomplished, What's in progress, Blockers, and Next week's priorities.`
    : `Generate a monthly project report with trends, achievements, challenges, and strategic recommendations.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: projectContext + '\n\n' + userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    return {
      report: completion.choices[0].message.content,
      generatedAt: new Date().toISOString(),
      model: 'gpt-4o',
      tokens: completion.usage?.total_tokens || 0
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return generateDemoReport(project, metrics, reportType)
  }
}

// ============================================================================
// HELPER: Generate Demo Report
// ============================================================================

function generateDemoReport(project: ProjectData, metrics: ReturnType<typeof calculateProjectMetrics>, reportType: string) {
  const healthStatus = metrics.progressPercentage >= 75 ? 'On Track'
    : metrics.progressPercentage >= 50 ? 'At Risk'
    : 'Critical'

  const report = `
## Project Status Report: ${project.title}

**Generated:** ${new Date().toLocaleDateString()}
**Overall Health:** ${healthStatus}
**Progress:** ${metrics.progressPercentage}% Complete

### Executive Summary

${project.title} is currently ${metrics.progressPercentage}% complete with ${metrics.completedTasks} of ${metrics.totalTasks} tasks finished. ${metrics.blockedTasks > 0 ? `There are ${metrics.blockedTasks} blocked tasks requiring immediate attention.` : 'No blockers are currently impacting progress.'} ${metrics.overdueTasks > 0 ? `${metrics.overdueTasks} tasks are overdue and need prioritization.` : 'All tasks are on schedule.'}

### Key Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Tasks Completed | ${metrics.completedTasks}/${metrics.totalTasks} | ${metrics.progressPercentage >= 70 ? '✅' : '⚠️'} |
| Hours Used | ${metrics.totalActualHours.toFixed(1)}h of ${metrics.totalEstimatedHours.toFixed(1)}h | ${metrics.hoursVariance <= 0 ? '✅' : '⚠️'} |
| Budget | ${metrics.budgetUsed}% used | ${metrics.budgetUsed <= 80 ? '✅' : '⚠️'} |
| Milestones | ${metrics.completedMilestones}/${metrics.totalMilestones} | ${metrics.overdueMilestones === 0 ? '✅' : '⚠️'} |

### Risks & Blockers

${metrics.blockedTasks > 0 ? `- **${metrics.blockedTasks} Blocked Tasks**: Require dependency resolution or resource allocation` : '- No critical blockers identified'}
${metrics.overdueTasks > 0 ? `- **${metrics.overdueTasks} Overdue Tasks**: Need immediate attention and timeline adjustment` : ''}
${metrics.hoursVariance > metrics.totalEstimatedHours * 0.2 ? `- **Hours Overrun**: ${metrics.hoursVariance.toFixed(1)} hours over estimate - review scope` : ''}

### Recommendations

1. ${metrics.blockedTasks > 0 ? 'Prioritize unblocking the ' + metrics.blockedTasks + ' blocked tasks through stakeholder alignment' : 'Continue current momentum - team is performing well'}
2. ${metrics.overdueTasks > 0 ? 'Review and adjust timeline for ' + metrics.overdueTasks + ' overdue tasks' : 'Maintain task scheduling discipline'}
3. ${metrics.hoursVariance > 0 ? 'Conduct scope review to address ' + metrics.hoursVariance.toFixed(1) + ' hours overrun' : 'Hours tracking is on target - continue monitoring'}

---
*AI-Generated Report by FreeFlow Project Intelligence*
`

  return {
    report: report.trim(),
    generatedAt: new Date().toISOString(),
    model: 'demo',
    tokens: 0
  }
}

// ============================================================================
// HELPER: Analyze Risks
// ============================================================================

function analyzeRisks(project: ProjectData, metrics: ReturnType<typeof calculateProjectMetrics>) {
  const risks: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    mitigation: string
    affectedTasks: number
  }> = []

  // Blocked tasks risk
  if (metrics.blockedTasks > 0) {
    risks.push({
      type: 'Blockers',
      severity: metrics.blockedTasks > 3 ? 'critical' : metrics.blockedTasks > 1 ? 'high' : 'medium',
      description: `${metrics.blockedTasks} tasks are currently blocked`,
      mitigation: 'Schedule blocker resolution meeting with stakeholders',
      affectedTasks: metrics.blockedTasks
    })
  }

  // Overdue tasks risk
  if (metrics.overdueTasks > 0) {
    risks.push({
      type: 'Timeline',
      severity: metrics.overdueTasks > 5 ? 'critical' : metrics.overdueTasks > 2 ? 'high' : 'medium',
      description: `${metrics.overdueTasks} tasks are past their due date`,
      mitigation: 'Review timeline and adjust priorities or add resources',
      affectedTasks: metrics.overdueTasks
    })
  }

  // Budget risk
  if (metrics.budgetUsed > 80) {
    risks.push({
      type: 'Budget',
      severity: metrics.budgetUsed > 95 ? 'critical' : 'high',
      description: `Budget is ${metrics.budgetUsed}% consumed`,
      mitigation: 'Review remaining scope and identify cost-saving opportunities',
      affectedTasks: 0
    })
  }

  // Hours overrun risk
  if (metrics.hoursVariance > metrics.totalEstimatedHours * 0.15) {
    risks.push({
      type: 'Effort',
      severity: metrics.hoursVariance > metrics.totalEstimatedHours * 0.3 ? 'high' : 'medium',
      description: `Hours overrun by ${metrics.hoursVariance.toFixed(1)} hours (${Math.round((metrics.hoursVariance / metrics.totalEstimatedHours) * 100)}%)`,
      mitigation: 'Conduct effort re-estimation and scope review',
      affectedTasks: 0
    })
  }

  // Milestone risk
  if (metrics.overdueMilestones > 0) {
    risks.push({
      type: 'Milestones',
      severity: 'high',
      description: `${metrics.overdueMilestones} milestones are overdue`,
      mitigation: 'Escalate to stakeholders and negotiate timeline adjustments',
      affectedTasks: 0
    })
  }

  // Low progress risk
  if (metrics.progressPercentage < 50 && project.end_date) {
    const daysRemaining = Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysRemaining < 14) {
      risks.push({
        type: 'Progress',
        severity: 'critical',
        description: `Only ${metrics.progressPercentage}% complete with ${daysRemaining} days remaining`,
        mitigation: 'Consider scope reduction or deadline extension',
        affectedTasks: metrics.totalTasks - metrics.completedTasks
      })
    }
  }

  return {
    risks,
    summary: {
      total: risks.length,
      critical: risks.filter(r => r.severity === 'critical').length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      low: risks.filter(r => r.severity === 'low').length
    },
    overallRisk: risks.some(r => r.severity === 'critical') ? 'critical'
      : risks.some(r => r.severity === 'high') ? 'high'
      : risks.some(r => r.severity === 'medium') ? 'medium'
      : 'low'
  }
}

// ============================================================================
// POST HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ProjectStatusRequest = await request.json()
    const { action, projectId, reportType = 'executive', includeTeamMetrics, includeMilestones, includeRisks } = body

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'projectId is required'
      }, { status: 400 })
    }

    // Fetch project data
    const project = await fetchProjectData(projectId)
    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 })
    }

    const metrics = calculateProjectMetrics(project)

    switch (action) {
      // ======================================================================
      // GENERATE REPORT
      // ======================================================================
      case 'generate-report': {
        const aiReport = await generateAIReport(project, metrics, reportType)
        const riskAnalysis = includeRisks ? analyzeRisks(project, metrics) : null

        return NextResponse.json({
          success: true,
          data: {
            project: {
              id: project.id,
              title: project.title,
              status: project.status
            },
            metrics,
            report: aiReport,
            risks: riskAnalysis,
            teamMetrics: includeTeamMetrics ? project.team_members : null,
            milestones: includeMilestones ? project.milestones : null
          }
        })
      }

      // ======================================================================
      // ANALYZE RISKS
      // ======================================================================
      case 'analyze-risks': {
        const riskAnalysis = analyzeRisks(project, metrics)

        return NextResponse.json({
          success: true,
          data: {
            project: {
              id: project.id,
              title: project.title
            },
            risks: riskAnalysis
          }
        })
      }

      // ======================================================================
      // PREDICT TIMELINE
      // ======================================================================
      case 'predict-timeline': {
        const completionRate = metrics.completedTasks / (metrics.totalTasks || 1)
        const avgTaskDuration = metrics.totalActualHours / (metrics.completedTasks || 1)
        const remainingTasks = metrics.totalTasks - metrics.completedTasks
        const estimatedRemainingHours = remainingTasks * avgTaskDuration

        const today = new Date()
        const predictedEndDate = new Date(today.getTime() + (estimatedRemainingHours * 60 * 60 * 1000))

        const isOnTrack = project.end_date ? predictedEndDate <= new Date(project.end_date) : true

        return NextResponse.json({
          success: true,
          data: {
            project: {
              id: project.id,
              title: project.title,
              originalEndDate: project.end_date
            },
            prediction: {
              predictedEndDate: predictedEndDate.toISOString(),
              estimatedRemainingHours,
              remainingTasks,
              avgTaskDuration,
              completionRate: Math.round(completionRate * 100),
              isOnTrack,
              daysVariance: project.end_date
                ? Math.ceil((predictedEndDate.getTime() - new Date(project.end_date).getTime()) / (1000 * 60 * 60 * 24))
                : 0,
              confidence: completionRate > 0.3 ? 'high' : completionRate > 0.1 ? 'medium' : 'low'
            }
          }
        })
      }

      // ======================================================================
      // TEAM INSIGHTS
      // ======================================================================
      case 'team-insights': {
        const teamInsights = (project.team_members || []).map(member => {
          const memberTasks = (project.tasks || []).filter(t => t.assignee_id === member.id)
          const completedTasks = memberTasks.filter(t => t.status === 'completed')
          const overdueTasks = memberTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed')

          return {
            ...member,
            totalTasks: memberTasks.length,
            completedTasks: completedTasks.length,
            inProgressTasks: memberTasks.filter(t => t.status === 'in_progress').length,
            overdueTasks: overdueTasks.length,
            completionRate: memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0,
            avgTaskDuration: completedTasks.length > 0
              ? completedTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0) / completedTasks.length
              : 0
          }
        })

        return NextResponse.json({
          success: true,
          data: {
            project: {
              id: project.id,
              title: project.title
            },
            teamInsights,
            summary: {
              totalMembers: teamInsights.length,
              avgCompletionRate: teamInsights.length > 0
                ? Math.round(teamInsights.reduce((sum, m) => sum + m.completionRate, 0) / teamInsights.length)
                : 0,
              topPerformer: teamInsights.sort((a, b) => b.completionRate - a.completionRate)[0]?.name || 'N/A'
            }
          }
        })
      }

      // ======================================================================
      // RECOMMENDATIONS
      // ======================================================================
      case 'recommendations': {
        const recommendations: Array<{
          priority: 'high' | 'medium' | 'low'
          category: string
          title: string
          description: string
          impact: string
        }> = []

        // Add recommendations based on metrics
        if (metrics.blockedTasks > 0) {
          recommendations.push({
            priority: 'high',
            category: 'Blockers',
            title: 'Resolve Blocked Tasks',
            description: `${metrics.blockedTasks} tasks are blocked. Schedule a blocker resolution meeting.`,
            impact: 'Unblocking could accelerate progress by 15-25%'
          })
        }

        if (metrics.overdueTasks > 0) {
          recommendations.push({
            priority: 'high',
            category: 'Timeline',
            title: 'Address Overdue Tasks',
            description: `${metrics.overdueTasks} tasks are overdue. Review and reprioritize.`,
            impact: 'Prevents further timeline slippage'
          })
        }

        if (metrics.hoursVariance > 0) {
          recommendations.push({
            priority: 'medium',
            category: 'Effort',
            title: 'Review Task Estimates',
            description: `Project is ${metrics.hoursVariance.toFixed(1)} hours over estimate. Consider scope adjustment.`,
            impact: 'Better budget and timeline predictability'
          })
        }

        if (metrics.progressPercentage < 50 && project.end_date) {
          recommendations.push({
            priority: 'high',
            category: 'Progress',
            title: 'Accelerate Delivery',
            description: 'Progress is below 50%. Consider adding resources or reducing scope.',
            impact: 'Increases likelihood of on-time delivery'
          })
        }

        // Add positive recommendations
        if (metrics.progressPercentage >= 80) {
          recommendations.push({
            priority: 'low',
            category: 'Success',
            title: 'Prepare for Completion',
            description: 'Project is nearly complete. Begin final review and handoff preparation.',
            impact: 'Smooth project closure and client satisfaction'
          })
        }

        return NextResponse.json({
          success: true,
          data: {
            project: {
              id: project.id,
              title: project.title
            },
            recommendations: recommendations.sort((a, b) =>
              a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
            ),
            metrics
          }
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['generate-report', 'analyze-risks', 'predict-timeline', 'team-insights', 'recommendations']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Project Status API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    }, { status: 500 })
  }
}

// ============================================================================
// GET HANDLER - Quick Status Check
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'project_id is required'
      }, { status: 400 })
    }

    const project = await fetchProjectData(projectId)
    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 })
    }

    const metrics = calculateProjectMetrics(project)
    const riskAnalysis = analyzeRisks(project, metrics)

    return NextResponse.json({
      success: true,
      data: {
        project: {
          id: project.id,
          title: project.title,
          status: project.status
        },
        metrics,
        health: riskAnalysis.overallRisk === 'low' ? 'healthy'
          : riskAnalysis.overallRisk === 'medium' ? 'at-risk'
          : 'critical',
        riskCount: riskAnalysis.summary.total
      }
    })
  } catch (error) {
    console.error('AI Project Status GET Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    }, { status: 500 })
  }
}
