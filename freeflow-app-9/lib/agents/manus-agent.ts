/**
 * Manus AI Agent - Core Agent System
 *
 * This is the main orchestrator for the AI code builder, implementing
 * Manus-like autonomous agent capabilities with multi-tool support.
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/client';
import { BrowserTool, BrowserAction, BrowserResult } from '@/lib/tools/browser-tool';
import { TerminalTool, TerminalResult } from '@/lib/tools/terminal-tool';

// Types
export interface AgentSession {
  id: string;
  userId: string;
  status: 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  title?: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter';
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  context: Record<string, unknown>;
  metadata: Record<string, unknown>;
  totalTokensUsed: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentTask {
  id: string;
  sessionId: string;
  userId: string;
  prompt: string;
  taskType: 'general' | 'code_generation' | 'web_app' | 'api' | 'component' | 'refactor' | 'debug' | 'test' | 'documentation';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting_input';
  priority: number;
  result?: unknown;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDurationMs?: number;
  actualDurationMs?: number;
}

export interface AgentStep {
  id: string;
  taskId: string;
  sessionId: string;
  stepNumber: number;
  action: string;
  tool: 'terminal' | 'browser' | 'file' | 'search' | 'code_edit' | 'code_create' | 'message' | 'think' | 'plan';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  reasoning?: string;
  durationMs?: number;
  tokensUsed: number;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolName?: string;
  toolCallId?: string;
  metadata?: Record<string, unknown>;
}

export interface GeneratedFile {
  id: string;
  taskId: string;
  filePath: string;
  fileName: string;
  content: string;
  language: string;
  framework?: string;
  fileType: 'component' | 'page' | 'api' | 'config' | 'style' | 'test' | 'util' | 'hook' | 'type' | 'other';
  sizeBytes: number;
  dependencies: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface AgentConfig {
  model?: string;
  provider?: 'openai' | 'anthropic' | 'google' | 'openrouter';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: ToolDefinition[];
  maxSteps?: number;
  onStep?: (step: AgentStep) => void;
  onMessage?: (message: AgentMessage) => void;
  onFile?: (file: GeneratedFile) => void;
  onError?: (error: Error) => void;
}

// Default system prompt for code generation
const DEFAULT_SYSTEM_PROMPT = `You are Manus, an advanced AI code builder assistant. You help users create full-stack web applications, components, and APIs from natural language descriptions.

## Your Capabilities:
1. **Code Generation**: Generate production-ready code in TypeScript, JavaScript, Python, and more
2. **Full-Stack Apps**: Create complete web applications with frontend, backend, and database
3. **Component Design**: Build reusable UI components with proper styling and accessibility
4. **API Development**: Design and implement RESTful and GraphQL APIs
5. **Testing**: Write comprehensive unit and integration tests
6. **Documentation**: Generate clear documentation and comments

## Available Tools:
- **code_create**: Create new code files
- **code_edit**: Modify existing code files
- **file**: Read, write, and manage files
- **terminal**: Execute shell commands
- **browser**: Browse web pages and take screenshots
- **search**: Search the web for information
- **think**: Reason through complex problems
- **plan**: Create step-by-step implementation plans

## Guidelines:
1. Always plan before coding
2. Write clean, maintainable, and well-documented code
3. Follow best practices for the chosen framework
4. Include error handling and validation
5. Consider security implications
6. Optimize for performance
7. Make code accessible and responsive

## Response Format:
When generating code, use this format:
\`\`\`language:filepath
// code here
\`\`\`

When using tools, respond with structured JSON indicating the tool and parameters.
`;

// Tool definitions for the agent
const AGENT_TOOLS: ToolDefinition[] = [
  {
    name: 'code_create',
    description: 'Create a new code file with the specified content',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'The path for the new file' },
        content: { type: 'string', description: 'The code content' },
        language: { type: 'string', description: 'Programming language (typescript, javascript, python, etc.)' },
        framework: { type: 'string', description: 'Framework if applicable (nextjs, react, express, etc.)' },
        fileType: {
          type: 'string',
          enum: ['component', 'page', 'api', 'config', 'style', 'test', 'util', 'hook', 'type', 'other'],
          description: 'Type of file being created'
        }
      },
      required: ['filePath', 'content', 'language']
    }
  },
  {
    name: 'code_edit',
    description: 'Edit an existing code file with specified changes',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file to edit' },
        oldContent: { type: 'string', description: 'The content to replace' },
        newContent: { type: 'string', description: 'The new content' },
        description: { type: 'string', description: 'Description of the change' }
      },
      required: ['filePath', 'oldContent', 'newContent']
    }
  },
  {
    name: 'file_read',
    description: 'Read the contents of a file',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file to read' },
        startLine: { type: 'number', description: 'Optional start line' },
        endLine: { type: 'number', description: 'Optional end line' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'file_write',
    description: 'Write content to a file',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file' },
        content: { type: 'string', description: 'Content to write' },
        append: { type: 'boolean', description: 'Whether to append to existing content' }
      },
      required: ['filePath', 'content']
    }
  },
  {
    name: 'file_search',
    description: 'Search for files matching a pattern or containing specific content',
    parameters: {
      type: 'object',
      properties: {
        directory: { type: 'string', description: 'Directory to search in' },
        pattern: { type: 'string', description: 'File name pattern (glob)' },
        contentPattern: { type: 'string', description: 'Content to search for (regex)' }
      },
      required: ['directory']
    }
  },
  {
    name: 'terminal',
    description: 'Execute a shell command',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The command to execute' },
        workingDirectory: { type: 'string', description: 'Working directory for the command' },
        timeout: { type: 'number', description: 'Timeout in milliseconds' }
      },
      required: ['command']
    }
  },
  {
    name: 'browser',
    description: 'Browse a web page and optionally take a screenshot',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' },
        action: {
          type: 'string',
          enum: ['navigate', 'screenshot', 'click', 'type', 'scroll'],
          description: 'Browser action to perform'
        },
        selector: { type: 'string', description: 'CSS selector for click/type actions' },
        text: { type: 'string', description: 'Text to type' }
      },
      required: ['url', 'action']
    }
  },
  {
    name: 'search',
    description: 'Search the web for information',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        maxResults: { type: 'number', description: 'Maximum number of results' }
      },
      required: ['query']
    }
  },
  {
    name: 'think',
    description: 'Reason through a complex problem step by step',
    parameters: {
      type: 'object',
      properties: {
        problem: { type: 'string', description: 'The problem to reason about' },
        approach: { type: 'string', description: 'Suggested approach' }
      },
      required: ['problem']
    }
  },
  {
    name: 'plan',
    description: 'Create a step-by-step implementation plan',
    parameters: {
      type: 'object',
      properties: {
        goal: { type: 'string', description: 'The goal to achieve' },
        constraints: { type: 'array', items: { type: 'string' }, description: 'Any constraints or requirements' }
      },
      required: ['goal']
    }
  }
];

/**
 * Manus Agent - Main class for autonomous code generation
 */
export class ManusAgent {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private supabase = createClient();
  private config: AgentConfig;
  private session: AgentSession | null = null;
  private currentTask: AgentTask | null = null;
  private steps: AgentStep[] = [];
  private messages: AgentMessage[] = [];
  private generatedFiles: GeneratedFile[] = [];
  private stepNumber = 0;

  // Tool instances
  private browserTool: BrowserTool | null = null;
  private terminalTool: TerminalTool | null = null;

  constructor(config: AgentConfig = {}) {
    this.config = {
      model: config.model || 'gpt-4o',
      provider: config.provider || 'openai',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
      systemPrompt: config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      tools: config.tools || AGENT_TOOLS,
      maxSteps: config.maxSteps || 50,
      ...config
    };

    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }

    // Initialize Tools (lazy initialization - created when first used)
  }

  /**
   * Get or create browser tool instance
   */
  private getBrowserTool(): BrowserTool {
    if (!this.browserTool) {
      this.browserTool = new BrowserTool({
        headless: true,
        timeout: 30000,
        viewport: { width: 1280, height: 720 }
      });
    }
    return this.browserTool;
  }

  /**
   * Get or create terminal tool instance
   */
  private getTerminalTool(): TerminalTool {
    if (!this.terminalTool) {
      this.terminalTool = new TerminalTool({
        maxOutputSize: 100000,
        defaultTimeout: 60000,
        sandboxMode: true
      });
    }
    return this.terminalTool;
  }

  /**
   * Cleanup tools on session end
   */
  async cleanup(): Promise<void> {
    if (this.browserTool) {
      await this.browserTool.close();
      this.browserTool = null;
    }
    if (this.terminalTool) {
      this.terminalTool.killAll();
      this.terminalTool = null;
    }
  }

  /**
   * Create a new agent session
   */
  async createSession(userId: string, title?: string): Promise<AgentSession> {
    const { data, error } = await this.supabase
      .from('agent_sessions')
      .insert({
        user_id: userId,
        title: title || 'New Coding Session',
        model: this.config.model,
        provider: this.config.provider,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        system_prompt: this.config.systemPrompt,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create session: ${error.message}`);

    this.session = this.mapSession(data);
    return this.session;
  }

  /**
   * Load an existing session
   */
  async loadSession(sessionId: string): Promise<AgentSession> {
    const { data, error } = await this.supabase
      .from('agent_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw new Error(`Failed to load session: ${error.message}`);

    this.session = this.mapSession(data);

    // Load messages
    const { data: messages } = await this.supabase
      .from('agent_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    this.messages = (messages || []).map(m => ({
      role: m.role,
      content: m.content,
      toolName: m.tool_name,
      toolCallId: m.tool_call_id,
      metadata: m.metadata
    }));

    return this.session;
  }

  /**
   * Run a task with the agent
   */
  async runTask(prompt: string, taskType: AgentTask['taskType'] = 'general'): Promise<AgentTask> {
    if (!this.session) {
      throw new Error('No active session. Create or load a session first.');
    }

    // Create task in database
    const { data: taskData, error: taskError } = await this.supabase
      .from('agent_tasks')
      .insert({
        session_id: this.session.id,
        user_id: this.session.userId,
        prompt,
        task_type: taskType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (taskError) throw new Error(`Failed to create task: ${taskError.message}`);

    this.currentTask = this.mapTask(taskData);
    this.stepNumber = 0;
    this.steps = [];
    this.generatedFiles = [];

    // Add user message
    await this.addMessage({ role: 'user', content: prompt });

    try {
      // Run the agent loop
      const result = await this.agentLoop();

      // Update task as completed
      await this.supabase
        .from('agent_tasks')
        .update({
          status: 'completed',
          result,
          completed_at: new Date().toISOString()
        })
        .eq('id', this.currentTask.id);

      this.currentTask.status = 'completed';
      this.currentTask.result = result;

      return this.currentTask;
    } catch (error) {
      // Update task as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.supabase
        .from('agent_tasks')
        .update({
          status: 'failed',
          error: errorMessage,
          completed_at: new Date().toISOString()
        })
        .eq('id', this.currentTask.id);

      this.currentTask.status = 'failed';
      this.currentTask.error = errorMessage;

      if (this.config.onError) {
        this.config.onError(error instanceof Error ? error : new Error(errorMessage));
      }

      throw error;
    }
  }

  /**
   * Main agent loop - iteratively plan and execute
   */
  private async agentLoop(): Promise<unknown> {
    let iterations = 0;
    const maxIterations = this.config.maxSteps || 50;

    while (iterations < maxIterations) {
      iterations++;

      // Get next action from LLM
      const response = await this.chat();

      // Check if we're done
      if (response.done) {
        return response.result;
      }

      // Execute tool if requested
      if (response.toolCall) {
        const toolResult = await this.executeTool(response.toolCall);

        // Add tool result to messages
        await this.addMessage({
          role: 'tool',
          content: JSON.stringify(toolResult),
          toolName: response.toolCall.name,
          toolCallId: response.toolCall.id
        });
      }
    }

    throw new Error('Max iterations reached without completion');
  }

  /**
   * Chat with the LLM
   */
  private async chat(): Promise<{ done: boolean; result?: unknown; toolCall?: { id: string; name: string; arguments: unknown } }> {
    const messages = this.buildMessages();

    if (this.config.provider === 'openai' && this.openai) {
      return this.chatOpenAI(messages);
    } else if (this.config.provider === 'anthropic' && this.anthropic) {
      return this.chatAnthropic(messages);
    } else {
      throw new Error(`Provider ${this.config.provider} not configured`);
    }
  }

  /**
   * Chat using OpenAI
   */
  private async chatOpenAI(messages: { role: string; content: string }[]): Promise<{ done: boolean; result?: unknown; toolCall?: { id: string; name: string; arguments: unknown } }> {
    const tools = this.config.tools?.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));

    const response = await this.openai!.chat.completions.create({
      model: this.config.model!,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      tools,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    });

    const message = response.choices[0].message;

    // Add assistant message
    await this.addMessage({
      role: 'assistant',
      content: message.content || ''
    });

    // Check for tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      return {
        done: false,
        toolCall: {
          id: toolCall.id,
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments)
        }
      };
    }

    // Check if task is complete
    if (message.content?.includes('[TASK_COMPLETE]') || this.generatedFiles.length > 0) {
      return {
        done: true,
        result: {
          message: message.content,
          files: this.generatedFiles
        }
      };
    }

    return { done: false };
  }

  /**
   * Chat using Anthropic
   */
  private async chatAnthropic(messages: { role: string; content: string }[]): Promise<{ done: boolean; result?: unknown; toolCall?: { id: string; name: string; arguments: unknown } }> {
    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';

    const tools = this.config.tools?.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters
    }));

    const response = await this.anthropic!.messages.create({
      model: this.config.model === 'gpt-4o' ? 'claude-3-5-sonnet-20241022' : this.config.model!,
      max_tokens: this.config.maxTokens!,
      system: systemMessage,
      messages: anthropicMessages,
      tools
    });

    // Process response
    let textContent = '';
    let toolUse = null;

    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        toolUse = block;
      }
    }

    // Add assistant message
    await this.addMessage({
      role: 'assistant',
      content: textContent
    });

    // Check for tool calls
    if (toolUse) {
      return {
        done: false,
        toolCall: {
          id: toolUse.id,
          name: toolUse.name,
          arguments: toolUse.input
        }
      };
    }

    // Check if task is complete
    if (textContent.includes('[TASK_COMPLETE]') || this.generatedFiles.length > 0) {
      return {
        done: true,
        result: {
          message: textContent,
          files: this.generatedFiles
        }
      };
    }

    return { done: false };
  }

  /**
   * Execute a tool
   */
  private async executeTool(toolCall: { id: string; name: string; arguments: unknown }): Promise<unknown> {
    this.stepNumber++;

    // Create step record
    const step: Partial<AgentStep> = {
      taskId: this.currentTask!.id,
      sessionId: this.session!.id,
      stepNumber: this.stepNumber,
      action: toolCall.name,
      tool: toolCall.name as AgentStep['tool'],
      input: toolCall.arguments as Record<string, unknown>,
      status: 'running'
    };

    const { data: stepData } = await this.supabase
      .from('agent_steps')
      .insert({
        task_id: step.taskId,
        session_id: step.sessionId,
        step_number: step.stepNumber,
        action: step.action,
        tool: step.tool,
        input: step.input,
        status: step.status
      })
      .select()
      .single();

    const startTime = Date.now();

    try {
      let result: unknown;

      switch (toolCall.name) {
        case 'code_create':
          result = await this.toolCodeCreate(toolCall.arguments as Record<string, unknown>);
          break;
        case 'code_edit':
          result = await this.toolCodeEdit(toolCall.arguments as Record<string, unknown>);
          break;
        case 'file_read':
          result = await this.toolFileRead(toolCall.arguments as Record<string, unknown>);
          break;
        case 'file_write':
          result = await this.toolFileWrite(toolCall.arguments as Record<string, unknown>);
          break;
        case 'file_search':
          result = await this.toolFileSearch(toolCall.arguments as Record<string, unknown>);
          break;
        case 'terminal':
          result = await this.toolTerminal(toolCall.arguments as Record<string, unknown>);
          break;
        case 'browser':
          result = await this.toolBrowser(toolCall.arguments as Record<string, unknown>);
          break;
        case 'search':
          result = await this.toolSearch(toolCall.arguments as Record<string, unknown>);
          break;
        case 'think':
          result = await this.toolThink(toolCall.arguments as Record<string, unknown>);
          break;
        case 'plan':
          result = await this.toolPlan(toolCall.arguments as Record<string, unknown>);
          break;
        default:
          result = { error: `Unknown tool: ${toolCall.name}` };
      }

      const durationMs = Date.now() - startTime;

      // Update step as completed
      await this.supabase
        .from('agent_steps')
        .update({
          output: result as Record<string, unknown>,
          status: 'completed',
          duration_ms: durationMs,
          completed_at: new Date().toISOString()
        })
        .eq('id', stepData?.id);

      // Notify callback
      if (this.config.onStep) {
        this.config.onStep({
          ...step,
          id: stepData?.id,
          output: result as Record<string, unknown>,
          status: 'completed',
          durationMs,
          tokensUsed: 0
        } as AgentStep);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';

      await this.supabase
        .from('agent_steps')
        .update({
          output: { error: errorMessage },
          status: 'failed',
          duration_ms: Date.now() - startTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', stepData?.id);

      return { error: errorMessage };
    }
  }

  // Tool implementations
  private async toolCodeCreate(args: Record<string, unknown>): Promise<unknown> {
    const { filePath, content, language, framework, fileType } = args as {
      filePath: string;
      content: string;
      language: string;
      framework?: string;
      fileType?: string;
    };

    const file: GeneratedFile = {
      id: crypto.randomUUID(),
      taskId: this.currentTask!.id,
      filePath,
      fileName: filePath.split('/').pop() || filePath,
      content,
      language,
      framework,
      fileType: (fileType as GeneratedFile['fileType']) || 'other',
      sizeBytes: new TextEncoder().encode(content).length,
      dependencies: []
    };

    // Save to database
    await this.supabase
      .from('generated_files')
      .insert({
        task_id: file.taskId,
        session_id: this.session!.id,
        user_id: this.session!.userId,
        file_path: file.filePath,
        file_name: file.fileName,
        content: file.content,
        language: file.language,
        framework: file.framework,
        file_type: file.fileType,
        size_bytes: file.sizeBytes,
        dependencies: file.dependencies
      });

    this.generatedFiles.push(file);

    if (this.config.onFile) {
      this.config.onFile(file);
    }

    return { success: true, file: { path: filePath, language, size: file.sizeBytes } };
  }

  private async toolCodeEdit(args: Record<string, unknown>): Promise<unknown> {
    const { filePath, oldContent, newContent, description } = args as {
      filePath: string;
      oldContent: string;
      newContent: string;
      description?: string;
    };

    // Find existing file
    const existingFile = this.generatedFiles.find(f => f.filePath === filePath);
    if (existingFile) {
      existingFile.content = existingFile.content.replace(oldContent, newContent);
      existingFile.sizeBytes = new TextEncoder().encode(existingFile.content).length;

      // Update in database
      await this.supabase
        .from('generated_files')
        .update({
          content: existingFile.content,
          size_bytes: existingFile.sizeBytes,
          updated_at: new Date().toISOString()
        })
        .eq('task_id', this.currentTask!.id)
        .eq('file_path', filePath);

      return { success: true, description };
    }

    return { success: false, error: 'File not found' };
  }

  private async toolFileRead(args: Record<string, unknown>): Promise<unknown> {
    const { filePath } = args as { filePath: string };
    const file = this.generatedFiles.find(f => f.filePath === filePath);
    return file ? { content: file.content } : { error: 'File not found' };
  }

  private async toolFileWrite(args: Record<string, unknown>): Promise<unknown> {
    return this.toolCodeCreate({ ...args, language: 'text', fileType: 'other' });
  }

  private async toolFileSearch(args: Record<string, unknown>): Promise<unknown> {
    const { pattern, contentPattern } = args as { directory: string; pattern?: string; contentPattern?: string };

    let files = this.generatedFiles;

    if (pattern) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      files = files.filter(f => regex.test(f.filePath));
    }

    if (contentPattern) {
      const regex = new RegExp(contentPattern);
      files = files.filter(f => regex.test(f.content));
    }

    return { files: files.map(f => ({ path: f.filePath, language: f.language })) };
  }

  private async toolTerminal(args: Record<string, unknown>): Promise<unknown> {
    const { command, workingDirectory, timeout } = args as {
      command: string;
      workingDirectory?: string;
      timeout?: number;
    };

    try {
      const terminal = this.getTerminalTool();
      const result: TerminalResult = await terminal.execute({
        command,
        cwd: workingDirectory,
        timeout,
        shell: true
      });

      return {
        success: result.success,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        duration: result.duration,
        truncated: result.truncated
      };
    } catch (error) {
      return {
        success: false,
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Command execution failed',
        exitCode: 1
      };
    }
  }

  private async toolBrowser(args: Record<string, unknown>): Promise<unknown> {
    const { url, action, selector, text, key, direction, amount, timeout, script, value } = args as {
      url: string;
      action: 'navigate' | 'screenshot' | 'click' | 'type' | 'scroll' | 'wait' | 'evaluate' | 'select' | 'hover' | 'press' | 'fill' | 'extract';
      selector?: string;
      text?: string;
      key?: string;
      direction?: 'up' | 'down';
      amount?: number;
      timeout?: number;
      script?: string;
      value?: string;
    };

    try {
      const browser = this.getBrowserTool();
      const browserAction: BrowserAction = {
        action,
        url,
        selector,
        text,
        key,
        direction,
        amount,
        timeout,
        script,
        value
      };

      const result: BrowserResult = await browser.execute(browserAction);

      return {
        success: result.success,
        action: result.action,
        url: result.url,
        title: result.title,
        content: result.content,
        screenshot: result.screenshot,
        extractedData: result.extractedData,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        action,
        url,
        error: error instanceof Error ? error.message : 'Browser action failed'
      };
    }
  }

  private async toolSearch(args: Record<string, unknown>): Promise<unknown> {
    const { query } = args as { query: string };
    // In a real implementation, this would call a search API
    return {
      results: [
        { title: 'Search result 1', url: 'https://example.com', snippet: 'Relevant information...' }
      ],
      query
    };
  }

  private async toolThink(args: Record<string, unknown>): Promise<unknown> {
    const { problem, approach } = args as { problem: string; approach?: string };
    return {
      problem,
      approach: approach || 'Analyzing...',
      reasoning: `Thinking about: ${problem}`
    };
  }

  private async toolPlan(args: Record<string, unknown>): Promise<unknown> {
    const { goal, constraints } = args as { goal: string; constraints?: string[] };
    return {
      goal,
      constraints: constraints || [],
      steps: [
        { step: 1, description: 'Analyze requirements' },
        { step: 2, description: 'Design architecture' },
        { step: 3, description: 'Implement core functionality' },
        { step: 4, description: 'Add styling and polish' },
        { step: 5, description: 'Test and validate' }
      ]
    };
  }

  /**
   * Add a message to the conversation
   */
  private async addMessage(message: AgentMessage): Promise<void> {
    this.messages.push(message);

    await this.supabase
      .from('agent_messages')
      .insert({
        session_id: this.session!.id,
        task_id: this.currentTask?.id,
        role: message.role,
        content: message.content,
        tool_name: message.toolName,
        tool_call_id: message.toolCallId,
        metadata: message.metadata || {}
      });

    if (this.config.onMessage) {
      this.config.onMessage(message);
    }
  }

  /**
   * Build messages array for LLM
   */
  private buildMessages(): { role: string; content: string }[] {
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: this.config.systemPrompt! }
    ];

    for (const msg of this.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    return messages;
  }

  // Mappers
  private mapSession(data: Record<string, unknown>): AgentSession {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      status: data.status as AgentSession['status'],
      title: data.title as string | undefined,
      model: data.model as string,
      provider: data.provider as AgentSession['provider'],
      temperature: data.temperature as number,
      maxTokens: data.max_tokens as number,
      systemPrompt: data.system_prompt as string | undefined,
      context: (data.context || {}) as Record<string, unknown>,
      metadata: (data.metadata || {}) as Record<string, unknown>,
      totalTokensUsed: data.total_tokens_used as number,
      totalCost: data.total_cost as number,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string)
    };
  }

  private mapTask(data: Record<string, unknown>): AgentTask {
    return {
      id: data.id as string,
      sessionId: data.session_id as string,
      userId: data.user_id as string,
      prompt: data.prompt as string,
      taskType: data.task_type as AgentTask['taskType'],
      status: data.status as AgentTask['status'],
      priority: data.priority as number,
      result: data.result,
      error: data.error as string | undefined,
      startedAt: data.started_at ? new Date(data.started_at as string) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at as string) : undefined,
      estimatedDurationMs: data.estimated_duration_ms as number | undefined,
      actualDurationMs: data.actual_duration_ms as number | undefined
    };
  }

  // Getters
  getSession(): AgentSession | null {
    return this.session;
  }

  getCurrentTask(): AgentTask | null {
    return this.currentTask;
  }

  getMessages(): AgentMessage[] {
    return [...this.messages];
  }

  getGeneratedFiles(): GeneratedFile[] {
    return [...this.generatedFiles];
  }

  getSteps(): AgentStep[] {
    return [...this.steps];
  }
}

// Export singleton factory
export function createManusAgent(config?: AgentConfig): ManusAgent {
  return new ManusAgent(config);
}

export default ManusAgent;
