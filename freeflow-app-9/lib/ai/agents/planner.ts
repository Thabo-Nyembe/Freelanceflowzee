/**
 * Planner Agent
 *
 * Strategic planning and task decomposition:
 * - Break down complex objectives into actionable steps
 * - Identify dependencies and optimal execution order
 * - Allocate resources and assign agents
 * - Risk assessment and mitigation planning
 * - Timeline and milestone generation
 */

import {
  Agent,
  AgentTask,
  AgentResult,
  AgentCapability,
  AgentContext,
  Artifact
} from '../agent-orchestrator'

// Types specific to Planner
export interface PlanStep {
  id: string
  description: string
  taskType: string
  agentId?: string
  agentRole: string
  input: any
  expectedOutput: string
  dependencies: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedDuration?: number
  risks?: string[]
  alternatives?: string[]
}

export interface ExecutionPlan {
  id: string
  objective: string
  summary: string
  steps: PlanStep[]
  estimatedTotalDuration: number
  criticalPath: string[]
  riskAssessment: RiskAssessment
  resources: ResourceAllocation[]
  milestones: Milestone[]
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high'
  risks: Array<{
    id: string
    description: string
    probability: number
    impact: number
    mitigation: string
  }>
}

export interface ResourceAllocation {
  agentId: string
  agentRole: string
  utilization: number
  tasks: string[]
}

export interface Milestone {
  id: string
  name: string
  description: string
  dependsOnSteps: string[]
  deadline?: Date
}

export interface PlannerConfig {
  model?: string
  maxSteps?: number
  enableRiskAnalysis?: boolean
  enableResourceOptimization?: boolean
  preferredAgentRoles?: Record<string, string>
}

// Planner capabilities
const PLANNER_CAPABILITIES: AgentCapability[] = [
  {
    name: 'decompose_task',
    description: 'Break down complex objectives into smaller actionable tasks',
    inputSchema: {
      objective: 'string',
      constraints: 'object (optional)',
      context: 'object (optional)'
    },
    outputSchema: {
      steps: 'PlanStep[]',
      dependencies: 'string[][]'
    }
  },
  {
    name: 'identify_dependencies',
    description: 'Analyze and map task dependencies',
    inputSchema: {
      tasks: 'PlanStep[]'
    },
    outputSchema: {
      dependencyGraph: 'Record<string, string[]>',
      criticalPath: 'string[]'
    }
  },
  {
    name: 'allocate_resources',
    description: 'Assign tasks to appropriate agents',
    inputSchema: {
      tasks: 'PlanStep[]',
      availableAgents: 'Agent[]'
    },
    outputSchema: {
      allocations: 'ResourceAllocation[]'
    }
  },
  {
    name: 'assess_risks',
    description: 'Identify and evaluate potential risks',
    inputSchema: {
      plan: 'ExecutionPlan'
    },
    outputSchema: {
      riskAssessment: 'RiskAssessment'
    }
  },
  {
    name: 'optimize_plan',
    description: 'Optimize execution order and resource usage',
    inputSchema: {
      plan: 'ExecutionPlan'
    },
    outputSchema: {
      optimizedPlan: 'ExecutionPlan'
    }
  }
]

/**
 * Create Planner Agent
 */
export function createPlannerAgent(config: PlannerConfig = {}): Agent {
  const context: AgentContext = {
    memory: new Map(),
    conversationHistory: [],
    tools: [],
    constraints: {
      maxIterations: 10,
      timeout: 60000
    }
  }

  const execute = async (task: AgentTask): Promise<AgentResult> => {
    const startTime = Date.now()
    let tokensUsed = 0
    let iterations = 0
    const artifacts: Artifact[] = []

    try {
      let output: any

      switch (task.type) {
        case 'plan':
          output = await createExecutionPlan(task.input, config)
          break
        case 'decompose':
          output = await decomposeObjective(task.input, config)
          break
        case 'dependencies':
          output = await analyzeDependencies(task.input)
          break
        case 'allocate':
          output = await allocateResources(task.input)
          break
        case 'risk':
          output = await assessRisks(task.input)
          break
        case 'optimize':
          output = await optimizePlan(task.input)
          break
        case 'feedback':
          output = await processFeedback(task.input)
          break
        default:
          output = await createExecutionPlan(task.input, config)
      }

      iterations = 1
      tokensUsed = estimateTokens(JSON.stringify(output))

      // Create plan artifact
      if (output.steps || output.plan) {
        artifacts.push({
          id: `plan-${Date.now()}`,
          type: 'document',
          name: 'execution_plan.json',
          content: output,
          metadata: { format: 'json' }
        })
      }

      return {
        taskId: task.id,
        success: true,
        output,
        metrics: {
          duration: Date.now() - startTime,
          tokensUsed,
          iterations,
          toolCalls: 0
        },
        artifacts
      }
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Planning failed',
        metrics: {
          duration: Date.now() - startTime,
          tokensUsed,
          iterations,
          toolCalls: 0
        }
      }
    }
  }

  return {
    id: 'planner-agent',
    name: 'Strategic Planner',
    role: 'planner',
    description: 'Specialized agent for strategic planning, task decomposition, and workflow optimization',
    capabilities: PLANNER_CAPABILITIES,
    status: 'idle',
    context,
    execute
  }
}

// Planning functions

async function createExecutionPlan(
  input: {
    objective: string
    availableAgents?: any[]
    context?: Record<string, any>
    constraints?: Record<string, any>
  },
  config: PlannerConfig
): Promise<ExecutionPlan> {
  const { objective, availableAgents = [], context = {} } = input

  // Decompose objective into steps
  const steps = await decomposeObjective({ objective, context }, config)

  // Analyze dependencies
  const { dependencyGraph, criticalPath } = await analyzeDependencies({ steps })

  // Update steps with dependencies
  steps.forEach(step => {
    step.dependencies = dependencyGraph[step.id] || []
  })

  // Allocate resources if agents available
  let resources: ResourceAllocation[] = []
  if (availableAgents.length > 0) {
    resources = await allocateResources({ steps, availableAgents })

    // Update steps with agent assignments
    resources.forEach(alloc => {
      alloc.tasks.forEach(taskId => {
        const step = steps.find(s => s.id === taskId)
        if (step) step.agentId = alloc.agentId
      })
    })
  }

  // Calculate milestones
  const milestones = generateMilestones(steps, criticalPath)

  // Risk assessment
  const riskAssessment = await assessRisks({ steps, criticalPath })

  // Calculate total duration
  const estimatedTotalDuration = calculateTotalDuration(steps, dependencyGraph)

  return {
    id: `plan-${Date.now()}`,
    objective,
    summary: generatePlanSummary(objective, steps),
    steps,
    estimatedTotalDuration,
    criticalPath,
    riskAssessment,
    resources,
    milestones
  }
}

async function decomposeObjective(
  input: { objective: string; context?: Record<string, any> },
  config: PlannerConfig
): Promise<PlanStep[]> {
  const { objective, context = {} } = input
  const maxSteps = config.maxSteps || 20

  // Analyze objective and create steps
  // This would typically use an LLM for intelligent decomposition
  const steps: PlanStep[] = []

  // Simple heuristic-based decomposition
  const objectiveLower = objective.toLowerCase()

  // Research phase
  if (objectiveLower.includes('analyze') || objectiveLower.includes('understand') ||
      objectiveLower.includes('research') || objectiveLower.includes('investigate')) {
    steps.push({
      id: `step-${steps.length}`,
      description: 'Research and gather information',
      taskType: 'research',
      agentRole: 'researcher',
      input: { topic: objective, context },
      expectedOutput: 'Research findings and analysis',
      dependencies: [],
      priority: 'high'
    })
  }

  // Planning phase
  steps.push({
    id: `step-${steps.length}`,
    description: 'Create detailed implementation plan',
    taskType: 'plan_details',
    agentRole: 'planner',
    input: { objective, previousSteps: steps.map(s => s.id) },
    expectedOutput: 'Detailed action items',
    dependencies: steps.length > 0 ? [steps[steps.length - 1].id] : [],
    priority: 'high'
  })

  // Implementation phase
  if (objectiveLower.includes('build') || objectiveLower.includes('create') ||
      objectiveLower.includes('implement') || objectiveLower.includes('develop')) {
    steps.push({
      id: `step-${steps.length}`,
      description: 'Execute implementation',
      taskType: 'execute',
      agentRole: 'executor',
      input: { objective, context },
      expectedOutput: 'Implementation deliverables',
      dependencies: [steps[steps.length - 1].id],
      priority: 'high'
    })
  }

  // Code phase
  if (objectiveLower.includes('code') || objectiveLower.includes('program') ||
      objectiveLower.includes('script') || objectiveLower.includes('function')) {
    steps.push({
      id: `step-${steps.length}`,
      description: 'Write and test code',
      taskType: 'code',
      agentRole: 'coder',
      input: { requirements: objective, context },
      expectedOutput: 'Working code with tests',
      dependencies: [steps[steps.length - 1].id],
      priority: 'high'
    })
  }

  // Testing phase
  steps.push({
    id: `step-${steps.length}`,
    description: 'Verify and validate results',
    taskType: 'test',
    agentRole: 'executor',
    input: { objective, deliverables: 'previous_step_output' },
    expectedOutput: 'Validation report',
    dependencies: [steps[steps.length - 1].id],
    priority: 'medium'
  })

  // Review phase
  steps.push({
    id: `step-${steps.length}`,
    description: 'Review quality and completeness',
    taskType: 'review',
    agentRole: 'reviewer',
    input: { objective, allDeliverables: 'all_previous_outputs' },
    expectedOutput: 'Review report with recommendations',
    dependencies: [steps[steps.length - 1].id],
    priority: 'medium'
  })

  return steps.slice(0, maxSteps)
}

async function analyzeDependencies(
  input: { steps: PlanStep[] }
): Promise<{ dependencyGraph: Record<string, string[]>; criticalPath: string[] }> {
  const { steps } = input
  const dependencyGraph: Record<string, string[]> = {}

  // Build dependency graph from step definitions
  steps.forEach(step => {
    dependencyGraph[step.id] = step.dependencies || []
  })

  // Find critical path (longest path through dependencies)
  const criticalPath = findCriticalPath(steps, dependencyGraph)

  return { dependencyGraph, criticalPath }
}

function findCriticalPath(
  steps: PlanStep[],
  dependencyGraph: Record<string, string[]>
): string[] {
  // Simple implementation - find the longest chain of dependencies
  const memo = new Map<string, string[]>()

  function getLongestPath(stepId: string): string[] {
    if (memo.has(stepId)) return memo.get(stepId)!

    const deps = dependencyGraph[stepId] || []
    if (deps.length === 0) {
      memo.set(stepId, [stepId])
      return [stepId]
    }

    let longestDepPath: string[] = []
    for (const dep of deps) {
      const depPath = getLongestPath(dep)
      if (depPath.length > longestDepPath.length) {
        longestDepPath = depPath
      }
    }

    const path = [...longestDepPath, stepId]
    memo.set(stepId, path)
    return path
  }

  // Find the longest path from any leaf node
  let criticalPath: string[] = []
  steps.forEach(step => {
    const path = getLongestPath(step.id)
    if (path.length > criticalPath.length) {
      criticalPath = path
    }
  })

  return criticalPath
}

async function allocateResources(
  input: { steps: PlanStep[]; availableAgents: any[] }
): Promise<ResourceAllocation[]> {
  const { steps, availableAgents } = input
  const allocations: ResourceAllocation[] = []

  // Group steps by required role
  const stepsByRole = new Map<string, PlanStep[]>()
  steps.forEach(step => {
    const role = step.agentRole
    if (!stepsByRole.has(role)) {
      stepsByRole.set(role, [])
    }
    stepsByRole.get(role)!.push(step)
  })

  // Assign agents to roles
  stepsByRole.forEach((roleSteps, role) => {
    // Find agents with matching role
    const matchingAgents = availableAgents.filter(a => a.role === role)

    if (matchingAgents.length > 0) {
      // Distribute tasks among matching agents
      matchingAgents.forEach((agent, i) => {
        const agentTasks = roleSteps
          .filter((_, idx) => idx % matchingAgents.length === i)
          .map(s => s.id)

        if (agentTasks.length > 0) {
          allocations.push({
            agentId: agent.id,
            agentRole: role,
            utilization: agentTasks.length / roleSteps.length,
            tasks: agentTasks
          })
        }
      })
    } else {
      // No matching agent - assign to first available
      const fallbackAgent = availableAgents[0]
      if (fallbackAgent) {
        const existing = allocations.find(a => a.agentId === fallbackAgent.id)
        if (existing) {
          existing.tasks.push(...roleSteps.map(s => s.id))
          existing.utilization = existing.tasks.length / steps.length
        } else {
          allocations.push({
            agentId: fallbackAgent.id,
            agentRole: fallbackAgent.role,
            utilization: roleSteps.length / steps.length,
            tasks: roleSteps.map(s => s.id)
          })
        }
      }
    }
  })

  return allocations
}

async function assessRisks(
  input: { steps?: PlanStep[]; criticalPath?: string[]; plan?: ExecutionPlan }
): Promise<RiskAssessment> {
  const steps = input.steps || input.plan?.steps || []
  const criticalPath = input.criticalPath || input.plan?.criticalPath || []

  const risks: RiskAssessment['risks'] = []

  // Analyze common risk patterns
  if (steps.length > 10) {
    risks.push({
      id: 'complexity',
      description: 'High number of steps increases complexity',
      probability: 0.4,
      impact: 0.6,
      mitigation: 'Consider breaking into smaller phases'
    })
  }

  if (criticalPath.length > 5) {
    risks.push({
      id: 'critical-path-length',
      description: 'Long critical path may delay completion',
      probability: 0.5,
      impact: 0.7,
      mitigation: 'Identify opportunities to parallelize tasks'
    })
  }

  // Check for single points of failure
  const roleCount = new Map<string, number>()
  steps.forEach(s => {
    roleCount.set(s.agentRole, (roleCount.get(s.agentRole) || 0) + 1)
  })

  roleCount.forEach((count, role) => {
    if (count > steps.length * 0.5) {
      risks.push({
        id: `bottleneck-${role}`,
        description: `${role} agent may become a bottleneck`,
        probability: 0.3,
        impact: 0.5,
        mitigation: `Consider distributing ${role} tasks or adding capacity`
      })
    }
  })

  // Calculate overall risk
  const avgRiskScore = risks.length > 0
    ? risks.reduce((sum, r) => sum + r.probability * r.impact, 0) / risks.length
    : 0

  return {
    overallRisk: avgRiskScore < 0.3 ? 'low' : avgRiskScore < 0.6 ? 'medium' : 'high',
    risks
  }
}

async function optimizePlan(input: { plan: ExecutionPlan }): Promise<ExecutionPlan> {
  const { plan } = input

  // Reorder steps to maximize parallelization
  const optimizedSteps = [...plan.steps]

  // Group by dependency level
  const levels = new Map<number, PlanStep[]>()
  const stepLevels = new Map<string, number>()

  function getLevel(stepId: string): number {
    if (stepLevels.has(stepId)) return stepLevels.get(stepId)!

    const step = plan.steps.find(s => s.id === stepId)
    if (!step || step.dependencies.length === 0) {
      stepLevels.set(stepId, 0)
      return 0
    }

    const maxDepLevel = Math.max(...step.dependencies.map(d => getLevel(d)))
    const level = maxDepLevel + 1
    stepLevels.set(stepId, level)
    return level
  }

  optimizedSteps.forEach(step => {
    const level = getLevel(step.id)
    if (!levels.has(level)) levels.set(level, [])
    levels.get(level)!.push(step)
  })

  // Flatten back maintaining order by level
  const reorderedSteps: PlanStep[] = []
  Array.from(levels.keys()).sort((a, b) => a - b).forEach(level => {
    reorderedSteps.push(...levels.get(level)!)
  })

  return {
    ...plan,
    steps: reorderedSteps
  }
}

function generateMilestones(steps: PlanStep[], criticalPath: string[]): Milestone[] {
  const milestones: Milestone[] = []

  // Create milestones at 25%, 50%, 75%, and 100% completion
  const checkpoints = [0.25, 0.5, 0.75, 1]

  checkpoints.forEach((pct, i) => {
    const stepIndex = Math.floor(steps.length * pct) - 1
    if (stepIndex >= 0) {
      const step = steps[stepIndex]
      milestones.push({
        id: `milestone-${i + 1}`,
        name: `Phase ${i + 1} Complete`,
        description: `Completed ${Math.round(pct * 100)}% of planned tasks including: ${step.description}`,
        dependsOnSteps: steps.slice(0, stepIndex + 1).map(s => s.id)
      })
    }
  })

  return milestones
}

function generatePlanSummary(objective: string, steps: PlanStep[]): string {
  const phaseCount = new Set(steps.map(s => s.agentRole)).size
  const criticalSteps = steps.filter(s => s.priority === 'high' || s.priority === 'critical').length

  return `Plan to "${objective}" consisting of ${steps.length} steps across ${phaseCount} phases. ` +
    `${criticalSteps} critical steps identified.`
}

function calculateTotalDuration(
  steps: PlanStep[],
  dependencyGraph: Record<string, string[]>
): number {
  // Estimate duration based on step complexity
  const avgDuration = 300000 // 5 minutes per step as baseline
  const parallelFactor = 0.7 // Assume 30% parallelization

  return Math.round(steps.length * avgDuration * parallelFactor)
}

async function processFeedback(input: {
  previousTask: AgentTask
  previousResult: AgentResult
}): Promise<{ nextTask?: AgentTask; complete: boolean }> {
  const { previousTask, previousResult } = input

  if (!previousResult.success) {
    // Create corrective task
    return {
      nextTask: {
        id: `retry-${previousTask.id}`,
        type: previousTask.type,
        description: `Retry: ${previousTask.description}`,
        input: {
          ...previousTask.input,
          previousError: previousResult.error,
          retryAttempt: true
        }
      },
      complete: false
    }
  }

  // Check if plan needs refinement
  if (previousResult.output?.steps && previousResult.output.steps.length > 0) {
    return { complete: true }
  }

  return { complete: true }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export { PlanStep, ExecutionPlan, RiskAssessment, ResourceAllocation, Milestone }
