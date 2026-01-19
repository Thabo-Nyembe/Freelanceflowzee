/**
 * AI Agents Module
 *
 * Export all agent types and factory functions
 */

// Planner Agent
export {
  createPlannerAgent,
  PlanStep,
  ExecutionPlan,
  RiskAssessment,
  ResourceAllocation,
  Milestone
} from './planner'

// Executor Agent
export {
  createExecutorAgent,
  ExecutionStep,
  ExecutionContext,
  ExecutorConfig
} from './executor'

// Reviewer Agent
export {
  createReviewerAgent,
  ReviewResult,
  ReviewType,
  ReviewIssue,
  Suggestion,
  ReviewMetrics,
  ReviewConfig,
  ReviewRule
} from './reviewer'

// Re-export orchestrator types for convenience
export type {
  Agent,
  AgentTask,
  AgentResult,
  AgentCapability,
  AgentContext,
  AgentTool,
  AgentRole,
  Workflow,
  WorkflowStep
} from '../agent-orchestrator'

/**
 * Create a complete agent team with all default agents
 */
export function createAgentTeam(config?: {
  planner?: Parameters<typeof import('./planner').createPlannerAgent>[0]
  executor?: Parameters<typeof import('./executor').createExecutorAgent>[0]
  reviewer?: Parameters<typeof import('./reviewer').createReviewerAgent>[0]
}) {
  const { createPlannerAgent } = require('./planner')
  const { createExecutorAgent } = require('./executor')
  const { createReviewerAgent } = require('./reviewer')

  return {
    planner: createPlannerAgent(config?.planner),
    executor: createExecutorAgent(config?.executor),
    reviewer: createReviewerAgent(config?.reviewer)
  }
}

/**
 * Register all default agents with an orchestrator
 */
export function registerDefaultAgents(
  orchestrator: import('../agent-orchestrator').AgentOrchestrator,
  config?: Parameters<typeof createAgentTeam>[0]
) {
  const team = createAgentTeam(config)

  orchestrator.registerAgent(team.planner)
  orchestrator.registerAgent(team.executor)
  orchestrator.registerAgent(team.reviewer)

  return team
}
