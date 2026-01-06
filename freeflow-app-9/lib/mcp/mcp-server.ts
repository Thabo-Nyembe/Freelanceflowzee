/**
 * MCP Server Implementation
 *
 * Exposes FreeFlow Kazi capabilities as MCP tools for AI agent integration.
 */

import { MCPTool, MCPResource, MCPPrompt, MCPToolCallResult, MCPServerInfo } from './mcp-client';
import { BrowserTool } from '@/lib/tools/browser-tool';
import { TerminalTool } from '@/lib/tools/terminal-tool';

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * MCP Server - Exposes tools via Model Context Protocol
 */
export class MCPServer {
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private prompts: Map<string, MCPPrompt> = new Map();
  private browserTool: BrowserTool | null = null;
  private terminalTool: TerminalTool | null = null;

  constructor() {
    this.registerBuiltInTools();
    this.registerBuiltInResources();
    this.registerBuiltInPrompts();
  }

  /**
   * Register built-in tools
   */
  private registerBuiltInTools(): void {
    // Code Generation Tool
    this.tools.set('code_generate', {
      name: 'code_generate',
      description: 'Generate code from natural language description',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'What to generate' },
          language: { type: 'string', description: 'Programming language', default: 'typescript' },
          framework: { type: 'string', description: 'Framework (nextjs, react, express, etc.)' },
          style: { type: 'string', description: 'Code style preferences' }
        },
        required: ['prompt']
      }
    });

    // File Operations Tool
    this.tools.set('file_operation', {
      name: 'file_operation',
      description: 'Perform file system operations',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['read', 'write', 'append', 'delete', 'list', 'search'],
            description: 'File operation to perform'
          },
          path: { type: 'string', description: 'File or directory path' },
          content: { type: 'string', description: 'Content for write/append operations' },
          pattern: { type: 'string', description: 'Search pattern for search operation' }
        },
        required: ['operation', 'path']
      }
    });

    // Shell Execute Tool
    this.tools.set('shell_execute', {
      name: 'shell_execute',
      description: 'Execute shell commands in a sandboxed environment',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' },
          cwd: { type: 'string', description: 'Working directory' },
          timeout: { type: 'number', description: 'Timeout in milliseconds', default: 60000 }
        },
        required: ['command']
      }
    });

    // Web Browse Tool
    this.tools.set('web_browse', {
      name: 'web_browse',
      description: 'Browse web pages and interact with them',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to navigate to' },
          action: {
            type: 'string',
            enum: ['navigate', 'screenshot', 'click', 'type', 'scroll', 'extract'],
            description: 'Browser action'
          },
          selector: { type: 'string', description: 'CSS selector for interactions' },
          text: { type: 'string', description: 'Text input for type action' }
        },
        required: ['url', 'action']
      }
    });

    // Web Search Tool
    this.tools.set('web_search', {
      name: 'web_search',
      description: 'Search the web for information',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          maxResults: { type: 'number', description: 'Maximum results', default: 10 }
        },
        required: ['query']
      }
    });

    // Database Query Tool
    this.tools.set('database_query', {
      name: 'database_query',
      description: 'Query the FreeFlow Kazi database',
      inputSchema: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Table name' },
          operation: { type: 'string', enum: ['select', 'insert', 'update', 'delete'] },
          filters: { type: 'object', description: 'Query filters' },
          data: { type: 'object', description: 'Data for insert/update' }
        },
        required: ['table', 'operation']
      }
    });

    // Project Manager Tool
    this.tools.set('project_manage', {
      name: 'project_manage',
      description: 'Manage code projects',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['create', 'build', 'test', 'deploy', 'analyze'],
            description: 'Project action'
          },
          projectPath: { type: 'string', description: 'Project directory' },
          options: { type: 'object', description: 'Action-specific options' }
        },
        required: ['action']
      }
    });
  }

  /**
   * Register built-in resources
   */
  private registerBuiltInResources(): void {
    this.resources.set('project://source', {
      uri: 'project://source',
      name: 'Project Source',
      description: 'Current project source code',
      mimeType: 'application/x-directory'
    });

    this.resources.set('project://config', {
      uri: 'project://config',
      name: 'Project Configuration',
      description: 'Project configuration files',
      mimeType: 'application/json'
    });

    this.resources.set('database://schema', {
      uri: 'database://schema',
      name: 'Database Schema',
      description: 'FreeFlow Kazi database schema',
      mimeType: 'application/json'
    });
  }

  /**
   * Register built-in prompts
   */
  private registerBuiltInPrompts(): void {
    this.prompts.set('code_review', {
      name: 'code_review',
      description: 'Review code for quality and best practices',
      arguments: [
        { name: 'code', description: 'Code to review', required: true },
        { name: 'language', description: 'Programming language', required: false }
      ]
    });

    this.prompts.set('explain_code', {
      name: 'explain_code',
      description: 'Explain what code does',
      arguments: [
        { name: 'code', description: 'Code to explain', required: true }
      ]
    });

    this.prompts.set('refactor_code', {
      name: 'refactor_code',
      description: 'Suggest refactoring improvements',
      arguments: [
        { name: 'code', description: 'Code to refactor', required: true },
        { name: 'goal', description: 'Refactoring goal', required: false }
      ]
    });

    this.prompts.set('generate_tests', {
      name: 'generate_tests',
      description: 'Generate unit tests for code',
      arguments: [
        { name: 'code', description: 'Code to test', required: true },
        { name: 'framework', description: 'Test framework', required: false }
      ]
    });
  }

  /**
   * Handle MCP request
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      let result: unknown;

      switch (request.method) {
        case 'initialize':
          result = this.handleInitialize();
          break;
        case 'tools/list':
          result = this.handleToolsList();
          break;
        case 'tools/call':
          result = await this.handleToolsCall(request.params as { name: string; arguments: Record<string, unknown> });
          break;
        case 'resources/list':
          result = this.handleResourcesList();
          break;
        case 'resources/read':
          result = await this.handleResourcesRead(request.params as { uri: string });
          break;
        case 'prompts/list':
          result = this.handlePromptsList();
          break;
        case 'prompts/get':
          result = await this.handlePromptsGet(request.params as { name: string; arguments?: Record<string, unknown> });
          break;
        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: `Method not found: ${request.method}`
            }
          };
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        result
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : 'Internal error'
        }
      };
    }
  }

  private handleInitialize(): MCPServerInfo {
    return {
      name: 'FreeFlow Kazi MCP Server',
      version: '1.0.0',
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: true,
        resources: true,
        prompts: true,
        logging: true
      }
    };
  }

  private handleToolsList(): { tools: MCPTool[] } {
    return { tools: Array.from(this.tools.values()) };
  }

  private async handleToolsCall(params: { name: string; arguments: Record<string, unknown> }): Promise<MCPToolCallResult> {
    const tool = this.tools.get(params.name);
    if (!tool) {
      return {
        content: [{ type: 'text', text: `Tool not found: ${params.name}` }],
        isError: true
      };
    }

    try {
      const result = await this.executeTool(params.name, params.arguments);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: error instanceof Error ? error.message : 'Tool execution failed' }],
        isError: true
      };
    }
  }

  private handleResourcesList(): { resources: MCPResource[] } {
    return { resources: Array.from(this.resources.values()) };
  }

  private async handleResourcesRead(params: { uri: string }): Promise<MCPToolCallResult> {
    const resource = this.resources.get(params.uri);
    if (!resource) {
      return {
        content: [{ type: 'text', text: `Resource not found: ${params.uri}` }],
        isError: true
      };
    }

    // Return placeholder content - in production would read actual resource
    return {
      content: [{
        type: 'resource',
        resource: resource
      }]
    };
  }

  private handlePromptsList(): { prompts: MCPPrompt[] } {
    return { prompts: Array.from(this.prompts.values()) };
  }

  private async handlePromptsGet(params: { name: string; arguments?: Record<string, unknown> }): Promise<{
    description?: string;
    messages: Array<{ role: 'user' | 'assistant'; content: { type: 'text'; text: string } }>;
  }> {
    const prompt = this.prompts.get(params.name);
    if (!prompt) {
      throw new Error(`Prompt not found: ${params.name}`);
    }

    // Generate prompt based on template
    const promptText = this.generatePromptText(params.name, params.arguments || {});

    return {
      description: prompt.description,
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: promptText }
        }
      ]
    };
  }

  /**
   * Execute a tool
   */
  private async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'shell_execute':
        return this.executeShell(args);
      case 'web_browse':
        return this.executeBrowser(args);
      case 'file_operation':
        return this.executeFileOp(args);
      case 'code_generate':
        return this.executeCodeGen(args);
      case 'web_search':
        return this.executeWebSearch(args);
      default:
        return { message: `Tool ${name} executed`, args };
    }
  }

  private async executeShell(args: Record<string, unknown>): Promise<unknown> {
    if (!this.terminalTool) {
      this.terminalTool = new TerminalTool({ sandboxMode: true });
    }

    return this.terminalTool.execute({
      command: args.command as string,
      cwd: args.cwd as string | undefined,
      timeout: args.timeout as number | undefined
    });
  }

  private async executeBrowser(args: Record<string, unknown>): Promise<unknown> {
    if (!this.browserTool) {
      this.browserTool = new BrowserTool({ headless: true });
    }

    return this.browserTool.execute({
      action: args.action as 'navigate' | 'screenshot' | 'click' | 'type' | 'scroll' | 'extract',
      url: args.url as string,
      selector: args.selector as string | undefined,
      text: args.text as string | undefined
    });
  }

  private async executeFileOp(args: Record<string, unknown>): Promise<unknown> {
    // Placeholder - would implement actual file operations
    return {
      operation: args.operation,
      path: args.path,
      status: 'completed'
    };
  }

  private async executeCodeGen(args: Record<string, unknown>): Promise<unknown> {
    // Placeholder - would integrate with AI code generation
    return {
      prompt: args.prompt,
      language: args.language || 'typescript',
      status: 'generated',
      code: '// Generated code placeholder'
    };
  }

  private async executeWebSearch(args: Record<string, unknown>): Promise<unknown> {
    // Placeholder - would integrate with search API
    return {
      query: args.query,
      results: []
    };
  }

  /**
   * Generate prompt text from template
   */
  private generatePromptText(name: string, args: Record<string, unknown>): string {
    switch (name) {
      case 'code_review':
        return `Please review the following code for quality, best practices, and potential issues:\n\n\`\`\`${args.language || ''}\n${args.code}\n\`\`\``;
      case 'explain_code':
        return `Please explain what the following code does:\n\n\`\`\`\n${args.code}\n\`\`\``;
      case 'refactor_code':
        return `Please suggest refactoring improvements for the following code${args.goal ? ` with the goal of ${args.goal}` : ''}:\n\n\`\`\`\n${args.code}\n\`\`\``;
      case 'generate_tests':
        return `Please generate unit tests for the following code${args.framework ? ` using ${args.framework}` : ''}:\n\n\`\`\`\n${args.code}\n\`\`\``;
      default:
        return JSON.stringify(args);
    }
  }

  /**
   * Cleanup resources
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
}

/**
 * Create MCP server instance
 */
export function createMCPServer(): MCPServer {
  return new MCPServer();
}

export default MCPServer;
