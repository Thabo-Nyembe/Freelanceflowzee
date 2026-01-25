/**
 * Executor Agent
 *
 * Task execution and implementation:
 * - Execute planned tasks step by step
 * - Tool usage and orchestration
 * - Progress tracking and reporting
 * - Error handling and recovery
 * - Output validation
 */

import {
  Agent,
  AgentTask,
  AgentResult,
  AgentCapability,
  AgentContext,
  AgentTool,
  Artifact
} from '../agent-orchestrator'

// Types specific to Executor
export interface ExecutionStep {
  id: string
  action: string
  tool?: string
  params?: Record<string, any>
  result?: any
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  error?: string
  duration?: number
}

export interface ExecutionContext {
  taskId: string
  startTime: Date
  steps: ExecutionStep[]
  variables: Map<string, any>
  artifacts: Artifact[]
  toolCalls: number
  iterations: number
}

export interface ExecutorConfig {
  model?: string
  maxIterations?: number
  maxToolCalls?: number
  timeout?: number
  enableLogging?: boolean
  tools?: AgentTool[]
  onStepStart?: (step: ExecutionStep) => void
  onStepComplete?: (step: ExecutionStep) => void
  onToolCall?: (tool: string, params: any) => void
}

// Default tools
const DEFAULT_TOOLS: AgentTool[] = [
  {
    name: 'web_search',
    description: 'Search the web for information',
    parameters: {
      query: { type: 'string', required: true },
      maxResults: { type: 'number', default: 5 }
    },
    execute: async (params) => {
      // Simulated web search
      return {
        results: [
          { title: `Result for: ${params.query}`, url: 'https://example.com', snippet: 'Sample search result' }
        ]
      }
    }
  },
  {
    name: 'read_file',
    description: 'Read content from a file',
    parameters: {
      path: { type: 'string', required: true },
      encoding: { type: 'string', default: 'utf-8' }
    },
    execute: async (params) => {
      // Would integrate with file system
      return { content: `Content of file: ${params.path}`, success: true }
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file',
    parameters: {
      path: { type: 'string', required: true },
      content: { type: 'string', required: true },
      mode: { type: 'string', default: 'overwrite' }
    },
    execute: async (params) => {
      // Would integrate with file system
      return { path: params.path, success: true, bytesWritten: params.content.length }
    }
  },
  {
    name: 'execute_code',
    description: 'Execute code in a sandboxed environment',
    parameters: {
      code: { type: 'string', required: true },
      language: { type: 'string', default: 'javascript' },
      timeout: { type: 'number', default: 30000 }
    },
    execute: async (params) => {
      // SECURITY: Code execution is disabled for security reasons
      // Arbitrary code execution via new Function() is a critical RCE vulnerability
      // Implement a proper sandbox (vm2, isolated-vm, or Deno) before enabling
      console.warn('Code execution tool is disabled for security reasons')
      return {
        output: null,
        success: false,
        error: 'Code execution is disabled. A sandboxed environment is required.'
      }
    }
  },
  {
    name: 'http_request',
    description: 'Make HTTP requests to APIs',
    parameters: {
      url: { type: 'string', required: true },
      method: { type: 'string', default: 'GET' },
      headers: { type: 'object', default: {} },
      body: { type: 'any' }
    },
    execute: async (params) => {
      try {
        const response = await fetch(params.url, {
          method: params.method,
          headers: params.headers,
          body: params.body ? JSON.stringify(params.body) : undefined
        })
        const data = await response.json()
        return { status: response.status, data, success: response.ok }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Request failed', success: false }
      }
    }
  },
  {
    name: 'database_query',
    description: 'Execute database queries',
    parameters: {
      query: { type: 'string', required: true },
      params: { type: 'array', default: [] }
    },
    execute: async (params) => {
      // Would integrate with database
      return { rows: [], rowCount: 0, success: true, simulated: true }
    }
  },
  {
    name: 'send_notification',
    description: 'Send notifications to users',
    parameters: {
      recipient: { type: 'string', required: true },
      message: { type: 'string', required: true },
      channel: { type: 'string', default: 'email' }
    },
    execute: async (params) => {
      // Would integrate with notification system
      return { sent: true, channel: params.channel, recipient: params.recipient }
    }
  },
  {
    name: 'transform_data',
    description: 'Transform data between formats',
    parameters: {
      data: { type: 'any', required: true },
      inputFormat: { type: 'string', required: true },
      outputFormat: { type: 'string', required: true }
    },
    execute: async (params) => {
      const { data, inputFormat, outputFormat } = params

      // JSON to/from other formats
      if (inputFormat === 'json' && outputFormat === 'csv') {
        if (Array.isArray(data) && data.length > 0) {
          const headers = Object.keys(data[0]).join(',')
          const rows = data.map(row => Object.values(row).join(',')).join('\n')
          return { result: `${headers}\n${rows}`, success: true }
        }
      }

      if (inputFormat === 'csv' && outputFormat === 'json') {
        const lines = String(data).split('\n')
        const headers = lines[0].split(',')
        const result = lines.slice(1).map(line => {
          const values = line.split(',')
          return headers.reduce((obj: any, header, i) => {
            obj[header.trim()] = values[i]?.trim()
            return obj
          }, {})
        })
        return { result, success: true }
      }

      return { result: data, success: true }
    }
  }
]

// Executor capabilities
const EXECUTOR_CAPABILITIES: AgentCapability[] = [
  {
    name: 'execute_task',
    description: 'Execute a planned task using available tools',
    inputSchema: {
      task: 'AgentTask',
      tools: 'AgentTool[] (optional)'
    },
    outputSchema: {
      result: 'any',
      steps: 'ExecutionStep[]',
      artifacts: 'Artifact[]'
    }
  },
  {
    name: 'run_tool',
    description: 'Execute a specific tool with parameters',
    inputSchema: {
      toolName: 'string',
      params: 'Record<string, any>'
    },
    outputSchema: {
      result: 'any',
      success: 'boolean'
    }
  },
  {
    name: 'chain_tools',
    description: 'Execute multiple tools in sequence',
    inputSchema: {
      steps: 'Array<{ tool: string, params: any }>'
    },
    outputSchema: {
      results: 'any[]',
      success: 'boolean'
    }
  },
  {
    name: 'parallel_execute',
    description: 'Execute multiple operations in parallel',
    inputSchema: {
      operations: 'Array<{ type: string, params: any }>'
    },
    outputSchema: {
      results: 'any[]',
      errors: 'string[]'
    }
  },
  {
    name: 'conditional_execute',
    description: 'Execute based on conditions',
    inputSchema: {
      condition: 'string | boolean',
      ifTrue: 'ExecutionStep',
      ifFalse: 'ExecutionStep (optional)'
    },
    outputSchema: {
      executed: 'string',
      result: 'any'
    }
  }
]

/**
 * Create Executor Agent
 */
export function createExecutorAgent(config: ExecutorConfig = {}): Agent {
  const tools = [...DEFAULT_TOOLS, ...(config.tools || [])]

  const context: AgentContext = {
    memory: new Map(),
    conversationHistory: [],
    tools,
    constraints: {
      maxIterations: config.maxIterations || 50,
      maxTokens: 100000,
      timeout: config.timeout || 300000,
      allowedTools: tools.map(t => t.name)
    }
  }

  const execute = async (task: AgentTask): Promise<AgentResult> => {
    const execContext: ExecutionContext = {
      taskId: task.id,
      startTime: new Date(),
      steps: [],
      variables: new Map(Object.entries(task.input || {})),
      artifacts: [],
      toolCalls: 0,
      iterations: 0
    }

    try {
      let output: any

      switch (task.type) {
        case 'execute':
          output = await executeGenericTask(task, execContext, tools, config)
          break
        case 'tool':
          output = await executeSingleTool(task.input, tools)
          break
        case 'chain':
          output = await executeToolChain(task.input, execContext, tools, config)
          break
        case 'parallel':
          output = await executeParallel(task.input, tools)
          break
        case 'conditional':
          output = await executeConditional(task.input, execContext, tools, config)
          break
        case 'communication':
          output = await handleCommunication(task.input, execContext)
          break
        default:
          output = await executeGenericTask(task, execContext, tools, config)
      }

      return {
        taskId: task.id,
        success: true,
        output,
        metrics: {
          duration: Date.now() - execContext.startTime.getTime(),
          tokensUsed: estimateTokens(JSON.stringify(output)),
          iterations: execContext.iterations,
          toolCalls: execContext.toolCalls
        },
        artifacts: execContext.artifacts
      }
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Execution failed',
        metrics: {
          duration: Date.now() - execContext.startTime.getTime(),
          tokensUsed: 0,
          iterations: execContext.iterations,
          toolCalls: execContext.toolCalls
        },
        artifacts: execContext.artifacts
      }
    }
  }

  return {
    id: 'executor-agent',
    name: 'Task Executor',
    role: 'executor',
    description: 'Specialized agent for executing tasks using available tools',
    capabilities: EXECUTOR_CAPABILITIES,
    status: 'idle',
    context,
    execute
  }
}

// Execution functions

async function executeGenericTask(
  task: AgentTask,
  context: ExecutionContext,
  tools: AgentTool[],
  config: ExecutorConfig
): Promise<any> {
  const maxIterations = config.maxIterations || 50
  const maxToolCalls = config.maxToolCalls || 20

  // Analyze task to determine required steps
  const executionPlan = analyzeAndPlan(task)

  const results: any[] = []

  for (const plannedStep of executionPlan) {
    if (context.iterations >= maxIterations) {
      throw new Error('Maximum iterations reached')
    }
    if (context.toolCalls >= maxToolCalls) {
      throw new Error('Maximum tool calls reached')
    }

    context.iterations++

    const step: ExecutionStep = {
      id: `step-${context.steps.length}`,
      action: plannedStep.action,
      tool: plannedStep.tool,
      params: resolveParams(plannedStep.params, context.variables),
      status: 'running'
    }

    context.steps.push(step)
    config.onStepStart?.(step)

    const stepStartTime = Date.now()

    try {
      if (step.tool) {
        const tool = tools.find(t => t.name === step.tool)
        if (!tool) {
          throw new Error(`Tool not found: ${step.tool}`)
        }

        config.onToolCall?.(step.tool, step.params)
        context.toolCalls++

        step.result = await tool.execute(step.params || {})
      } else {
        // Non-tool action (logic, assignment, etc.)
        step.result = await executeNonToolAction(step.action, step.params, context)
      }

      step.status = 'completed'
      step.duration = Date.now() - stepStartTime

      // Store result in variables for subsequent steps
      context.variables.set(`step_${step.id}_result`, step.result)
      results.push(step.result)

      // Check for artifacts
      if (step.result?.artifact) {
        context.artifacts.push(step.result.artifact)
      }
    } catch (error) {
      step.status = 'failed'
      step.error = error instanceof Error ? error.message : 'Unknown error'
      step.duration = Date.now() - stepStartTime

      // Try recovery
      const recovered = await attemptRecovery(step, context, tools)
      if (!recovered) {
        throw error
      }
    }

    config.onStepComplete?.(step)
  }

  return {
    steps: context.steps,
    results,
    variables: Object.fromEntries(context.variables),
    artifacts: context.artifacts
  }
}

function analyzeAndPlan(task: AgentTask): Array<{
  action: string
  tool?: string
  params?: Record<string, any>
}> {
  const plan: Array<{ action: string; tool?: string; params?: Record<string, any> }> = []
  const description = task.description.toLowerCase()
  const input = task.input || {}

  // Analyze task description and input to determine steps
  if (description.includes('search') || description.includes('find')) {
    plan.push({
      action: 'search',
      tool: 'web_search',
      params: { query: input.query || task.description }
    })
  }

  if (description.includes('read') || description.includes('load')) {
    plan.push({
      action: 'read',
      tool: 'read_file',
      params: { path: input.path || input.file }
    })
  }

  if (description.includes('write') || description.includes('save')) {
    plan.push({
      action: 'write',
      tool: 'write_file',
      params: { path: input.path, content: input.content }
    })
  }

  if (description.includes('execute') || description.includes('run')) {
    plan.push({
      action: 'execute',
      tool: 'execute_code',
      params: { code: input.code, language: input.language }
    })
  }

  if (description.includes('api') || description.includes('request') || description.includes('fetch')) {
    plan.push({
      action: 'request',
      tool: 'http_request',
      params: { url: input.url, method: input.method, body: input.body }
    })
  }

  if (description.includes('transform') || description.includes('convert')) {
    plan.push({
      action: 'transform',
      tool: 'transform_data',
      params: { data: input.data, inputFormat: input.inputFormat, outputFormat: input.outputFormat }
    })
  }

  if (description.includes('notify') || description.includes('send') || description.includes('alert')) {
    plan.push({
      action: 'notify',
      tool: 'send_notification',
      params: { recipient: input.recipient, message: input.message, channel: input.channel }
    })
  }

  // If no specific tools identified, add a generic processing step
  if (plan.length === 0) {
    plan.push({
      action: 'process',
      params: input
    })
  }

  return plan
}

function resolveParams(
  params: Record<string, any> | undefined,
  variables: Map<string, any>
): Record<string, any> {
  if (!params) return {}

  const resolved: Record<string, any> = {}

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.startsWith('$')) {
      // Variable reference
      const varName = value.substring(1)
      resolved[key] = variables.get(varName) ?? value
    } else if (typeof value === 'string' && value.includes('{{') && value.includes('}}')) {
      // Template interpolation
      resolved[key] = value.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
        return String(variables.get(varName) ?? '')
      })
    } else {
      resolved[key] = value
    }
  }

  return resolved
}

async function executeNonToolAction(
  action: string,
  params: Record<string, any> | undefined,
  context: ExecutionContext
): Promise<any> {
  switch (action) {
    case 'process':
      // Generic processing - return input as-is
      return { processed: true, data: params }

    case 'assign':
      // Assign value to variable
      if (params?.name && params?.value !== undefined) {
        context.variables.set(params.name, params.value)
        return { assigned: true, name: params.name }
      }
      return { assigned: false }

    case 'condition':
      // Evaluate condition
      const condition = params?.condition
      const result = Boolean(condition)
      return { condition, result }

    case 'aggregate':
      // Aggregate multiple results
      const items = params?.items || []
      return {
        count: items.length,
        items,
        aggregated: true
      }

    case 'format':
      // Format output
      return {
        formatted: JSON.stringify(params?.data, null, 2),
        format: params?.format || 'json'
      }

    default:
      return { action, params, processed: true }
  }
}

async function attemptRecovery(
  failedStep: ExecutionStep,
  context: ExecutionContext,
  tools: AgentTool[]
): Promise<boolean> {
  // Simple retry logic
  if (failedStep.tool) {
    const tool = tools.find(t => t.name === failedStep.tool)
    if (tool) {
      try {
        failedStep.result = await tool.execute(failedStep.params || {})
        failedStep.status = 'completed'
        failedStep.error = undefined
        return true
      } catch {
        return false
      }
    }
  }
  return false
}

async function executeSingleTool(
  input: { toolName: string; params: Record<string, any> },
  tools: AgentTool[]
): Promise<any> {
  const tool = tools.find(t => t.name === input.toolName)
  if (!tool) {
    throw new Error(`Tool not found: ${input.toolName}`)
  }

  return await tool.execute(input.params)
}

async function executeToolChain(
  input: { steps: Array<{ tool: string; params: any }> },
  context: ExecutionContext,
  tools: AgentTool[],
  config: ExecutorConfig
): Promise<any> {
  const results: any[] = []
  let previousResult: any = null

  for (const step of input.steps) {
    const tool = tools.find(t => t.name === step.tool)
    if (!tool) {
      throw new Error(`Tool not found: ${step.tool}`)
    }

    // Inject previous result if referenced
    const params = { ...step.params }
    if (params.input === '$previous') {
      params.input = previousResult
    }

    config.onToolCall?.(step.tool, params)
    context.toolCalls++

    const result = await tool.execute(params)
    results.push(result)
    previousResult = result
  }

  return { results, finalResult: previousResult }
}

async function executeParallel(
  input: { operations: Array<{ type: string; params: any }> },
  tools: AgentTool[]
): Promise<any> {
  const promises = input.operations.map(async (op) => {
    try {
      if (op.type === 'tool') {
        const tool = tools.find(t => t.name === op.params.name)
        if (tool) {
          return { success: true, result: await tool.execute(op.params) }
        }
      }
      return { success: true, result: op }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  const settled = await Promise.all(promises)

  return {
    results: settled.filter(r => r.success).map(r => r.result),
    errors: settled.filter(r => !r.success).map(r => r.error)
  }
}

async function executeConditional(
  input: {
    condition: string | boolean
    ifTrue: { action: string; tool?: string; params?: any }
    ifFalse?: { action: string; tool?: string; params?: any }
  },
  context: ExecutionContext,
  tools: AgentTool[],
  config: ExecutorConfig
): Promise<any> {
  let conditionResult: boolean

  if (typeof input.condition === 'boolean') {
    conditionResult = input.condition
  } else if (typeof input.condition === 'string') {
    // Check if it's a variable reference
    if (input.condition.startsWith('$')) {
      conditionResult = Boolean(context.variables.get(input.condition.substring(1)))
    } else {
      // Simple expression evaluation
      conditionResult = Boolean(input.condition)
    }
  } else {
    conditionResult = false
  }

  const stepToExecute = conditionResult ? input.ifTrue : input.ifFalse

  if (!stepToExecute) {
    return { executed: 'none', condition: conditionResult }
  }

  if (stepToExecute.tool) {
    const tool = tools.find(t => t.name === stepToExecute.tool)
    if (tool) {
      config.onToolCall?.(stepToExecute.tool, stepToExecute.params)
      context.toolCalls++
      const result = await tool.execute(stepToExecute.params || {})
      return { executed: conditionResult ? 'ifTrue' : 'ifFalse', result }
    }
  }

  return {
    executed: conditionResult ? 'ifTrue' : 'ifFalse',
    action: stepToExecute.action,
    params: stepToExecute.params
  }
}

async function handleCommunication(
  input: { message: string; from: string; context?: Record<string, any> },
  execContext: ExecutionContext
): Promise<string> {
  const { message, from, context } = input

  // Store communication in context
  execContext.variables.set('last_message', message)
  execContext.variables.set('last_sender', from)

  // Generate response based on message content
  let response: string

  if (message.toLowerCase().includes('status')) {
    response = `Current execution status: ${execContext.steps.length} steps completed, ${execContext.toolCalls} tool calls made.`
  } else if (message.toLowerCase().includes('help')) {
    response = 'I can execute tasks using various tools including web search, file operations, code execution, API requests, and data transformation.'
  } else if (message.toLowerCase().includes('result')) {
    const lastResult = execContext.variables.get('last_result')
    response = lastResult ? `Last result: ${JSON.stringify(lastResult)}` : 'No results available yet.'
  } else {
    response = `Acknowledged message from ${from}. Processing...`
  }

  return response
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export { ExecutionStep, ExecutionContext, ExecutorConfig }
