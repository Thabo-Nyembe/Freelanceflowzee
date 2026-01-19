/**
 * Agent Orchestrator
 *
 * Multi-agent system for complex task automation:
 * - Agent coordination and communication
 * - Task decomposition and delegation
 * - State management across agents
 * - Error recovery and retry logic
 * - Memory and context sharing
 */

import { EventEmitter } from 'events'

// Types
export type AgentRole = 'planner' | 'executor' | 'reviewer' | 'researcher' | 'coder' | 'analyst' | 'custom'

export interface AgentCapability {
  name: string
  description: string
  inputSchema?: Record<string, any>
  outputSchema?: Record<string, any>
}

export interface Agent {
  id: string
  name: string
  role: AgentRole
  description: string
  capabilities: AgentCapability[]
  status: 'idle' | 'busy' | 'error' | 'offline'
  context: AgentContext
  execute: (task: AgentTask) => Promise<AgentResult>
}

export interface AgentContext {
  memory: Map<string, any>
  conversationHistory: ConversationMessage[]
  tools: AgentTool[]
  constraints?: AgentConstraints
}

export interface AgentConstraints {
  maxTokens?: number
  maxIterations?: number
  timeout?: number
  allowedTools?: string[]
  forbiddenActions?: string[]
}

export interface AgentTool {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (params: Record<string, any>) => Promise<any>
}

export interface AgentTask {
  id: string
  type: string
  description: string
  input: any
  metadata?: Record<string, any>
  dependencies?: string[]
  priority?: 'low' | 'medium' | 'high' | 'critical'
  deadline?: Date
}

export interface AgentResult {
  taskId: string
  success: boolean
  output: any
  error?: string
  metrics: {
    duration: number
    tokensUsed: number
    iterations: number
    toolCalls: number
  }
  artifacts?: Artifact[]
}

export interface Artifact {
  id: string
  type: 'code' | 'document' | 'data' | 'image' | 'other'
  name: string
  content: any
  metadata?: Record<string, any>
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface WorkflowStep {
  id: string
  agentId: string
  task: AgentTask
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  result?: AgentResult
  retries: number
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  context: Map<string, any>
  startedAt?: Date
  completedAt?: Date
}

export interface OrchestratorConfig {
  maxConcurrentTasks?: number
  defaultTimeout?: number
  retryLimit?: number
  enableLogging?: boolean
  onTaskStart?: (task: AgentTask, agent: Agent) => void
  onTaskComplete?: (result: AgentResult, agent: Agent) => void
  onTaskError?: (error: Error, task: AgentTask, agent: Agent) => void
}

// Events
export type OrchestratorEvent =
  | 'agent:registered'
  | 'agent:unregistered'
  | 'task:queued'
  | 'task:started'
  | 'task:completed'
  | 'task:failed'
  | 'workflow:started'
  | 'workflow:completed'
  | 'workflow:failed'

/**
 * AgentOrchestrator class
 */
export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map()
  private taskQueue: AgentTask[] = []
  private activeWorkflows: Map<string, Workflow> = new Map()
  private sharedMemory: Map<string, any> = new Map()
  private config: OrchestratorConfig

  constructor(config: OrchestratorConfig = {}) {
    super()
    this.config = {
      maxConcurrentTasks: 5,
      defaultTimeout: 60000,
      retryLimit: 3,
      enableLogging: true,
      ...config
    }
  }

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent)
    this.emit('agent:registered', agent)
    this.log(`Agent registered: ${agent.name} (${agent.role})`)
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId)
    if (agent) {
      this.agents.delete(agentId)
      this.emit('agent:unregistered', agent)
      this.log(`Agent unregistered: ${agent.name}`)
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId)
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: AgentRole): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.role === role)
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.status === 'idle')
  }

  /**
   * Execute a single task
   */
  async executeTask(task: AgentTask, agentId?: string): Promise<AgentResult> {
    // Find appropriate agent
    const agent = agentId
      ? this.agents.get(agentId)
      : this.findBestAgent(task)

    if (!agent) {
      throw new Error(`No suitable agent found for task: ${task.type}`)
    }

    if (agent.status !== 'idle') {
      throw new Error(`Agent ${agent.name} is not available (status: ${agent.status})`)
    }

    return await this.runTaskWithAgent(task, agent)
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: Workflow): Promise<Workflow> {
    workflow.status = 'running'
    workflow.startedAt = new Date()
    this.activeWorkflows.set(workflow.id, workflow)
    this.emit('workflow:started', workflow)

    try {
      // Execute steps in order, respecting dependencies
      const completedSteps = new Set<string>()

      while (completedSteps.size < workflow.steps.length) {
        // Find executable steps
        const executableSteps = workflow.steps.filter(step => {
          if (completedSteps.has(step.id)) return false
          if (step.status === 'completed' || step.status === 'failed' || step.status === 'skipped') return false

          // Check dependencies
          const deps = step.task.dependencies || []
          return deps.every(depId => completedSteps.has(depId))
        })

        if (executableSteps.length === 0) {
          // Check for deadlock
          const pendingSteps = workflow.steps.filter(s =>
            !completedSteps.has(s.id) &&
            s.status !== 'completed' &&
            s.status !== 'failed' &&
            s.status !== 'skipped'
          )
          if (pendingSteps.length > 0) {
            throw new Error('Workflow deadlock detected - circular dependencies')
          }
          break
        }

        // Execute steps (with concurrency limit)
        const batchSize = Math.min(executableSteps.length, this.config.maxConcurrentTasks || 5)
        const batch = executableSteps.slice(0, batchSize)

        await Promise.all(batch.map(async step => {
          const agent = this.agents.get(step.agentId)
          if (!agent) {
            step.status = 'failed'
            step.result = {
              taskId: step.task.id,
              success: false,
              output: null,
              error: `Agent ${step.agentId} not found`,
              metrics: { duration: 0, tokensUsed: 0, iterations: 0, toolCalls: 0 }
            }
            completedSteps.add(step.id)
            return
          }

          try {
            // Inject workflow context into task
            step.task.metadata = {
              ...step.task.metadata,
              workflowContext: Object.fromEntries(workflow.context)
            }

            step.status = 'running'
            const result = await this.runTaskWithAgent(step.task, agent)
            step.result = result
            step.status = result.success ? 'completed' : 'failed'

            // Update workflow context with results
            workflow.context.set(`step_${step.id}_result`, result.output)
          } catch (error) {
            step.status = 'failed'
            step.result = {
              taskId: step.task.id,
              success: false,
              output: null,
              error: error instanceof Error ? error.message : 'Unknown error',
              metrics: { duration: 0, tokensUsed: 0, iterations: 0, toolCalls: 0 }
            }
          }

          completedSteps.add(step.id)
        }))
      }

      // Check workflow status
      const failedSteps = workflow.steps.filter(s => s.status === 'failed')
      workflow.status = failedSteps.length > 0 ? 'failed' : 'completed'
      workflow.completedAt = new Date()

      this.emit(workflow.status === 'completed' ? 'workflow:completed' : 'workflow:failed', workflow)
      return workflow
    } catch (error) {
      workflow.status = 'failed'
      workflow.completedAt = new Date()
      this.emit('workflow:failed', workflow)
      throw error
    } finally {
      this.activeWorkflows.delete(workflow.id)
    }
  }

  /**
   * Create a workflow from task description
   */
  async planWorkflow(
    objective: string,
    context?: Record<string, any>
  ): Promise<Workflow> {
    // Use planner agent to decompose the objective
    const plannerAgent = this.getAgentsByRole('planner')[0]
    if (!plannerAgent) {
      throw new Error('No planner agent available')
    }

    const planTask: AgentTask = {
      id: `plan-${Date.now()}`,
      type: 'plan',
      description: 'Create execution plan for objective',
      input: {
        objective,
        availableAgents: Array.from(this.agents.values()).map(a => ({
          id: a.id,
          name: a.name,
          role: a.role,
          capabilities: a.capabilities
        })),
        context
      }
    }

    const planResult = await this.runTaskWithAgent(planTask, plannerAgent)

    if (!planResult.success || !planResult.output.steps) {
      throw new Error('Failed to create workflow plan')
    }

    // Create workflow from plan
    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: objective.substring(0, 50),
      description: objective,
      steps: planResult.output.steps.map((step: any, index: number) => ({
        id: `step-${index}`,
        agentId: step.agentId || this.findBestAgentId(step.taskType),
        task: {
          id: `task-${Date.now()}-${index}`,
          type: step.taskType,
          description: step.description,
          input: step.input,
          dependencies: step.dependencies,
          priority: step.priority
        },
        status: 'pending' as const,
        retries: 0
      })),
      status: 'pending',
      context: new Map(Object.entries(context || {}))
    }

    return workflow
  }

  /**
   * Run an agentic loop for complex tasks
   */
  async agenticLoop(
    initialTask: AgentTask,
    options: {
      maxIterations?: number
      terminationCondition?: (result: AgentResult) => boolean
      feedbackAgent?: string
    } = {}
  ): Promise<AgentResult[]> {
    const maxIterations = options.maxIterations || 10
    const results: AgentResult[] = []
    let currentTask = initialTask
    let iteration = 0

    while (iteration < maxIterations) {
      iteration++
      this.log(`Agentic loop iteration ${iteration}/${maxIterations}`)

      // Execute task
      const result = await this.executeTask(currentTask)
      results.push(result)

      // Check termination
      if (options.terminationCondition?.(result)) {
        this.log('Termination condition met')
        break
      }

      if (!result.success) {
        this.log('Task failed, attempting recovery')
        // Try to recover with reviewer feedback
        const reviewerAgent = this.getAgentsByRole('reviewer')[0]
        if (reviewerAgent) {
          const reviewResult = await this.runTaskWithAgent({
            id: `review-${Date.now()}`,
            type: 'review',
            description: 'Review failed task and suggest corrections',
            input: {
              originalTask: currentTask,
              error: result.error,
              output: result.output
            }
          }, reviewerAgent)

          if (reviewResult.success && reviewResult.output.correctedTask) {
            currentTask = reviewResult.output.correctedTask
            continue
          }
        }
        break
      }

      // Get feedback for next iteration if feedback agent specified
      if (options.feedbackAgent) {
        const feedbackAgentInstance = this.agents.get(options.feedbackAgent)
        if (feedbackAgentInstance) {
          const feedbackResult = await this.runTaskWithAgent({
            id: `feedback-${Date.now()}`,
            type: 'feedback',
            description: 'Provide feedback and next task',
            input: {
              previousTask: currentTask,
              previousResult: result
            }
          }, feedbackAgentInstance)

          if (feedbackResult.success && feedbackResult.output.nextTask) {
            currentTask = feedbackResult.output.nextTask
          } else {
            break
          }
        } else {
          break
        }
      } else {
        break
      }
    }

    return results
  }

  /**
   * Communicate between agents
   */
  async agentCommunication(
    fromAgentId: string,
    toAgentId: string,
    message: string,
    context?: Record<string, any>
  ): Promise<string> {
    const fromAgent = this.agents.get(fromAgentId)
    const toAgent = this.agents.get(toAgentId)

    if (!fromAgent || !toAgent) {
      throw new Error('Agent not found')
    }

    // Add to conversation history
    fromAgent.context.conversationHistory.push({
      role: 'assistant',
      content: message,
      timestamp: new Date(),
      metadata: { to: toAgentId }
    })

    // Execute communication task on receiving agent
    const result = await this.runTaskWithAgent({
      id: `comm-${Date.now()}`,
      type: 'communication',
      description: `Message from ${fromAgent.name}`,
      input: {
        message,
        from: fromAgentId,
        context
      }
    }, toAgent)

    // Add response to histories
    const response = result.success ? result.output : 'Failed to process message'

    toAgent.context.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: { from: fromAgentId }
    })

    toAgent.context.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    })

    return response
  }

  /**
   * Store data in shared memory
   */
  setSharedMemory(key: string, value: any): void {
    this.sharedMemory.set(key, value)
  }

  /**
   * Retrieve data from shared memory
   */
  getSharedMemory(key: string): any {
    return this.sharedMemory.get(key)
  }

  /**
   * Get orchestrator status
   */
  getStatus(): {
    agents: number
    availableAgents: number
    queuedTasks: number
    activeWorkflows: number
  } {
    return {
      agents: this.agents.size,
      availableAgents: this.getAvailableAgents().length,
      queuedTasks: this.taskQueue.length,
      activeWorkflows: this.activeWorkflows.size
    }
  }

  // Private methods

  private async runTaskWithAgent(task: AgentTask, agent: Agent): Promise<AgentResult> {
    const startTime = Date.now()
    agent.status = 'busy'

    this.emit('task:started', task, agent)
    this.config.onTaskStart?.(task, agent)
    this.log(`Starting task ${task.id} on agent ${agent.name}`)

    try {
      // Set timeout
      const timeout = task.metadata?.timeout || this.config.defaultTimeout || 60000
      const timeoutPromise = new Promise<AgentResult>((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), timeout)
      })

      // Execute with timeout
      const result = await Promise.race([
        agent.execute(task),
        timeoutPromise
      ])

      result.metrics.duration = Date.now() - startTime

      this.emit('task:completed', result, agent)
      this.config.onTaskComplete?.(result, agent)
      this.log(`Task ${task.id} completed in ${result.metrics.duration}ms`)

      return result
    } catch (error) {
      const errorResult: AgentResult = {
        taskId: task.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          duration: Date.now() - startTime,
          tokensUsed: 0,
          iterations: 0,
          toolCalls: 0
        }
      }

      this.emit('task:failed', error, task, agent)
      this.config.onTaskError?.(error as Error, task, agent)
      this.log(`Task ${task.id} failed: ${errorResult.error}`)

      return errorResult
    } finally {
      agent.status = 'idle'
    }
  }

  private findBestAgent(task: AgentTask): Agent | undefined {
    const available = this.getAvailableAgents()

    // Match by task type to agent role
    const roleMapping: Record<string, AgentRole[]> = {
      'plan': ['planner'],
      'execute': ['executor'],
      'review': ['reviewer'],
      'research': ['researcher'],
      'code': ['coder'],
      'analyze': ['analyst'],
      'communication': ['planner', 'executor']
    }

    const preferredRoles = roleMapping[task.type] || ['executor']

    // Find agent with matching role
    for (const role of preferredRoles) {
      const agent = available.find(a => a.role === role)
      if (agent) return agent
    }

    // Fallback to any available agent
    return available[0]
  }

  private findBestAgentId(taskType: string): string {
    const agent = this.findBestAgent({ id: '', type: taskType, description: '', input: null })
    return agent?.id || Array.from(this.agents.values())[0]?.id || ''
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[Orchestrator] ${message}`)
    }
  }
}

// Singleton instance
let orchestratorInstance: AgentOrchestrator | null = null

/**
 * Get or create orchestrator instance
 */
export function getOrchestrator(config?: OrchestratorConfig): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator(config)
  }
  return orchestratorInstance
}

/**
 * Create new orchestrator instance
 */
export function createOrchestrator(config?: OrchestratorConfig): AgentOrchestrator {
  return new AgentOrchestrator(config)
}

/**
 * Create a basic agent
 */
export function createAgent(
  id: string,
  name: string,
  role: AgentRole,
  executor: (task: AgentTask) => Promise<AgentResult>
): Agent {
  return {
    id,
    name,
    role,
    description: `${role} agent`,
    capabilities: [],
    status: 'idle',
    context: {
      memory: new Map(),
      conversationHistory: [],
      tools: []
    },
    execute: executor
  }
}

/**
 * Create a workflow
 */
export function createWorkflow(
  name: string,
  description: string,
  steps: Array<{
    agentId: string
    task: Omit<AgentTask, 'id'>
  }>
): Workflow {
  return {
    id: `workflow-${Date.now()}`,
    name,
    description,
    steps: steps.map((step, index) => ({
      id: `step-${index}`,
      agentId: step.agentId,
      task: {
        id: `task-${Date.now()}-${index}`,
        ...step.task
      },
      status: 'pending',
      retries: 0
    })),
    status: 'pending',
    context: new Map()
  }
}
