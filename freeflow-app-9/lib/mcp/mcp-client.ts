/**
 * MCP (Model Context Protocol) Client
 *
 * Provides integration with the Model Context Protocol for AI agent tool orchestration.
 * Based on OpenManus and Claude's MCP specification.
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface MCPToolCallResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
    resource?: MCPResource;
  }>;
  isError?: boolean;
}

export interface MCPServerCapabilities {
  tools?: boolean;
  resources?: boolean;
  prompts?: boolean;
  logging?: boolean;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities: MCPServerCapabilities;
}

export interface MCPClientConfig {
  serverUrl?: string;
  transport?: 'stdio' | 'http' | 'websocket';
  timeout?: number;
  apiKey?: string;
}

/**
 * MCP Client for tool orchestration
 */
export class MCPClient {
  private config: MCPClientConfig;
  private connected: boolean = false;
  private serverInfo: MCPServerInfo | null = null;
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private prompts: Map<string, MCPPrompt> = new Map();

  constructor(config: MCPClientConfig = {}) {
    this.config = {
      transport: config.transport ?? 'http',
      timeout: config.timeout ?? 30000,
      ...config
    };
  }

  /**
   * Initialize connection to MCP server
   */
  async connect(): Promise<MCPServerInfo> {
    if (this.connected) {
      return this.serverInfo!;
    }

    try {
      // Initialize handshake
      this.serverInfo = await this.initialize();
      this.connected = true;

      // Discover available capabilities
      if (this.serverInfo.capabilities.tools) {
        await this.discoverTools();
      }
      if (this.serverInfo.capabilities.resources) {
        await this.discoverResources();
      }
      if (this.serverInfo.capabilities.prompts) {
        await this.discoverPrompts();
      }

      return this.serverInfo;
    } catch (error) {
      throw new Error(`MCP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.serverInfo = null;
    this.tools.clear();
    this.resources.clear();
    this.prompts.clear();
  }

  /**
   * Initialize MCP handshake
   */
  private async initialize(): Promise<MCPServerInfo> {
    const response = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        experimental: {}
      },
      clientInfo: {
        name: 'FreeFlow Kazi Manus Agent',
        version: '1.0.0'
      }
    });

    return response as MCPServerInfo;
  }

  /**
   * Discover available tools
   */
  private async discoverTools(): Promise<void> {
    const response = await this.sendRequest('tools/list', {});
    const tools = (response as { tools: MCPTool[] }).tools || [];

    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
  }

  /**
   * Discover available resources
   */
  private async discoverResources(): Promise<void> {
    const response = await this.sendRequest('resources/list', {});
    const resources = (response as { resources: MCPResource[] }).resources || [];

    for (const resource of resources) {
      this.resources.set(resource.uri, resource);
    }
  }

  /**
   * Discover available prompts
   */
  private async discoverPrompts(): Promise<void> {
    const response = await this.sendRequest('prompts/list', {});
    const prompts = (response as { prompts: MCPPrompt[] }).prompts || [];

    for (const prompt of prompts) {
      this.prompts.set(prompt.name, prompt);
    }
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<MCPToolCallResult> {
    if (!this.connected) {
      throw new Error('MCP client not connected');
    }

    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    const response = await this.sendRequest('tools/call', {
      name,
      arguments: args
    });

    return response as MCPToolCallResult;
  }

  /**
   * Read a resource
   */
  async readResource(uri: string): Promise<MCPToolCallResult> {
    if (!this.connected) {
      throw new Error('MCP client not connected');
    }

    const response = await this.sendRequest('resources/read', { uri });
    return response as MCPToolCallResult;
  }

  /**
   * Get a prompt
   */
  async getPrompt(name: string, args?: Record<string, unknown>): Promise<{
    description?: string;
    messages: Array<{ role: 'user' | 'assistant'; content: { type: 'text'; text: string } }>;
  }> {
    if (!this.connected) {
      throw new Error('MCP client not connected');
    }

    const response = await this.sendRequest('prompts/get', {
      name,
      arguments: args || {}
    });

    return response as {
      description?: string;
      messages: Array<{ role: 'user' | 'assistant'; content: { type: 'text'; text: string } }>;
    };
  }

  /**
   * Send request to MCP server
   */
  private async sendRequest(method: string, params: unknown): Promise<unknown> {
    if (this.config.transport === 'http' && this.config.serverUrl) {
      const response = await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: this.generateId(),
          method,
          params
        }),
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || 'MCP request failed');
      }

      return result.result;
    }

    // For local/simulated mode when no server is configured
    return this.simulateRequest(method, params);
  }

  /**
   * Simulate MCP requests for local development
   */
  private async simulateRequest(method: string, params: unknown): Promise<unknown> {
    switch (method) {
      case 'initialize':
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

      case 'tools/list':
        return {
          tools: [
            {
              name: 'code_generate',
              description: 'Generate code from natural language',
              inputSchema: {
                type: 'object',
                properties: {
                  prompt: { type: 'string', description: 'Code generation prompt' },
                  language: { type: 'string', description: 'Target programming language' },
                  framework: { type: 'string', description: 'Target framework' }
                },
                required: ['prompt']
              }
            },
            {
              name: 'file_operation',
              description: 'Perform file operations',
              inputSchema: {
                type: 'object',
                properties: {
                  operation: { type: 'string', enum: ['read', 'write', 'delete', 'list'] },
                  path: { type: 'string', description: 'File or directory path' },
                  content: { type: 'string', description: 'Content for write operations' }
                },
                required: ['operation', 'path']
              }
            },
            {
              name: 'shell_execute',
              description: 'Execute shell commands',
              inputSchema: {
                type: 'object',
                properties: {
                  command: { type: 'string', description: 'Shell command to execute' },
                  cwd: { type: 'string', description: 'Working directory' }
                },
                required: ['command']
              }
            },
            {
              name: 'web_browse',
              description: 'Browse web pages',
              inputSchema: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'URL to browse' },
                  action: { type: 'string', enum: ['navigate', 'screenshot', 'extract'] }
                },
                required: ['url']
              }
            }
          ]
        };

      case 'resources/list':
        return {
          resources: [
            {
              uri: 'file://./src',
              name: 'Source Code',
              description: 'Project source code directory'
            },
            {
              uri: 'file://./docs',
              name: 'Documentation',
              description: 'Project documentation'
            }
          ]
        };

      case 'prompts/list':
        return {
          prompts: [
            {
              name: 'code_review',
              description: 'Review code for best practices',
              arguments: [{ name: 'code', description: 'Code to review', required: true }]
            },
            {
              name: 'explain_code',
              description: 'Explain what code does',
              arguments: [{ name: 'code', description: 'Code to explain', required: true }]
            }
          ]
        };

      case 'tools/call':
        const toolParams = params as { name: string; arguments: Record<string, unknown> };
        return {
          content: [{
            type: 'text',
            text: `Tool ${toolParams.name} executed with args: ${JSON.stringify(toolParams.arguments)}`
          }]
        };

      case 'resources/read':
        return {
          content: [{
            type: 'text',
            text: 'Resource content placeholder'
          }]
        };

      case 'prompts/get':
        return {
          messages: [{
            role: 'user',
            content: { type: 'text', text: 'Prompt template placeholder' }
          }]
        };

      default:
        throw new Error(`Unknown MCP method: ${method}`);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateId(): string {
    return `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Getters
  getTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  getResources(): MCPResource[] {
    return Array.from(this.resources.values());
  }

  getPrompts(): MCPPrompt[] {
    return Array.from(this.prompts.values());
  }

  isConnected(): boolean {
    return this.connected;
  }

  getServerInfo(): MCPServerInfo | null {
    return this.serverInfo;
  }
}

/**
 * Create MCP client factory
 */
export function createMCPClient(config?: MCPClientConfig): MCPClient {
  return new MCPClient(config);
}

export default MCPClient;
