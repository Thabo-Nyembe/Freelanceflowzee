/**
 * Terminal Tool
 *
 * Provides sandboxed shell command execution for the Manus AI agent.
 * Inspired by OpenManus and OpenHands terminal implementations.
 */

import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import { EventEmitter } from 'events';

export interface TerminalCommand {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  shell?: boolean;
}

export interface TerminalResult {
  success: boolean;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal?: string;
  duration: number;
  timestamp: string;
  truncated?: boolean;
}

export interface TerminalToolConfig {
  maxOutputSize?: number;
  defaultTimeout?: number;
  allowedCommands?: string[];
  blockedCommands?: string[];
  workingDirectory?: string;
  sandboxMode?: boolean;
}

// Commands that are always blocked for security
const BLOCKED_COMMANDS = [
  'rm -rf /',
  'rm -rf ~',
  'rm -rf *',
  'mkfs',
  'dd if=/dev/zero',
  'dd if=/dev/random',
  ':(){:|:&};:',
  'chmod -R 777 /',
  'chown -R',
  'sudo rm',
  'sudo chmod',
  'sudo chown',
  '> /dev/sda',
  'wget http',
  'curl | bash',
  'wget | bash',
  'sh <(',
  'bash <('
];

// Safe commands that are always allowed
const SAFE_COMMANDS = [
  'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find', 'wc',
  'date', 'whoami', 'hostname', 'uname', 'env', 'printenv',
  'node', 'npm', 'npx', 'yarn', 'pnpm',
  'python', 'python3', 'pip', 'pip3',
  'git', 'gh',
  'which', 'type', 'file', 'stat',
  'mkdir', 'touch', 'cp', 'mv',
  'tsc', 'eslint', 'prettier',
  'jest', 'vitest', 'playwright'
];

/**
 * Terminal Tool - Command execution with sandboxing
 */
export class TerminalTool extends EventEmitter {
  private config: TerminalToolConfig;
  private runningProcesses: Map<string, ChildProcess> = new Map();

  constructor(config: TerminalToolConfig = {}) {
    super();
    this.config = {
      maxOutputSize: config.maxOutputSize ?? 100000, // 100KB
      defaultTimeout: config.defaultTimeout ?? 60000, // 60 seconds
      allowedCommands: config.allowedCommands,
      blockedCommands: [...BLOCKED_COMMANDS, ...(config.blockedCommands || [])],
      workingDirectory: config.workingDirectory ?? process.cwd(),
      sandboxMode: config.sandboxMode ?? true
    };
  }

  /**
   * Execute a command
   */
  async execute(cmd: TerminalCommand): Promise<TerminalResult> {
    const startTime = Date.now();
    const commandId = this.generateId();

    // Validate command
    const validation = this.validateCommand(cmd.command);
    if (!validation.valid) {
      return {
        success: false,
        command: cmd.command,
        stdout: '',
        stderr: validation.reason || 'Command blocked',
        exitCode: 1,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    return new Promise((resolve) => {
      const timeout = cmd.timeout ?? this.config.defaultTimeout!;
      let stdout = '';
      let stderr = '';
      let killed = false;

      const spawnOptions: SpawnOptions = {
        cwd: cmd.cwd ?? this.config.workingDirectory,
        env: { ...process.env, ...cmd.env },
        shell: cmd.shell ?? true,
        timeout
      };

      const proc = spawn(cmd.command, cmd.args || [], spawnOptions);
      this.runningProcesses.set(commandId, proc);

      // Collect stdout
      proc.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        if (stdout.length < this.config.maxOutputSize!) {
          stdout += chunk;
          this.emit('stdout', { commandId, data: chunk });
        }
      });

      // Collect stderr
      proc.stderr?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        if (stderr.length < this.config.maxOutputSize!) {
          stderr += chunk;
          this.emit('stderr', { commandId, data: chunk });
        }
      });

      // Handle timeout
      const timeoutHandle = setTimeout(() => {
        if (!killed) {
          killed = true;
          proc.kill('SIGTERM');
          setTimeout(() => {
            if (!proc.killed) {
              proc.kill('SIGKILL');
            }
          }, 1000);
        }
      }, timeout);

      // Handle completion
      proc.on('close', (code, signal) => {
        clearTimeout(timeoutHandle);
        this.runningProcesses.delete(commandId);

        const truncated = stdout.length >= this.config.maxOutputSize! ||
                          stderr.length >= this.config.maxOutputSize!;

        resolve({
          success: code === 0 && !killed,
          command: cmd.command,
          stdout: stdout.slice(0, this.config.maxOutputSize),
          stderr: stderr.slice(0, this.config.maxOutputSize),
          exitCode: code,
          signal: signal || undefined,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          truncated
        });
      });

      // Handle errors
      proc.on('error', (error) => {
        clearTimeout(timeoutHandle);
        this.runningProcesses.delete(commandId);

        resolve({
          success: false,
          command: cmd.command,
          stdout,
          stderr: error.message,
          exitCode: 1,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeSequence(commands: TerminalCommand[]): Promise<TerminalResult[]> {
    const results: TerminalResult[] = [];

    for (const cmd of commands) {
      const result = await this.execute(cmd);
      results.push(result);

      // Stop on first failure unless explicitly continuing
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute commands in parallel
   */
  async executeParallel(commands: TerminalCommand[]): Promise<TerminalResult[]> {
    return Promise.all(commands.map(cmd => this.execute(cmd)));
  }

  /**
   * Kill a running process
   */
  killProcess(commandId: string): boolean {
    const proc = this.runningProcesses.get(commandId);
    if (proc) {
      proc.kill('SIGTERM');
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      }, 1000);
      this.runningProcesses.delete(commandId);
      return true;
    }
    return false;
  }

  /**
   * Kill all running processes
   */
  killAll(): void {
    for (const [id, proc] of this.runningProcesses) {
      proc.kill('SIGKILL');
      this.runningProcesses.delete(id);
    }
  }

  /**
   * Validate a command for security
   */
  private validateCommand(command: string): { valid: boolean; reason?: string } {
    const commandLower = command.toLowerCase();

    // Check blocked patterns
    for (const blocked of this.config.blockedCommands!) {
      if (commandLower.includes(blocked.toLowerCase())) {
        return { valid: false, reason: `Command contains blocked pattern: ${blocked}` };
      }
    }

    // In sandbox mode, only allow safe commands
    if (this.config.sandboxMode) {
      const baseCommand = command.split(' ')[0].split('/').pop() || '';

      // Check if it's an allowed command
      if (this.config.allowedCommands && this.config.allowedCommands.length > 0) {
        const isAllowed = this.config.allowedCommands.some(
          allowed => baseCommand === allowed || baseCommand.startsWith(allowed)
        );
        if (!isAllowed) {
          return { valid: false, reason: `Command not in allowed list: ${baseCommand}` };
        }
      }

      // Check safe commands
      const isSafe = SAFE_COMMANDS.some(
        safe => baseCommand === safe || command.startsWith(safe + ' ')
      );

      if (!isSafe && !this.config.allowedCommands) {
        // Allow npm/node scripts and common dev tools
        const devPatterns = [
          /^npm\s+/,
          /^yarn\s+/,
          /^pnpm\s+/,
          /^npx\s+/,
          /^node\s+/,
          /^python3?\s+/,
          /^git\s+/,
          /^tsc(\s+|$)/,
          /^next\s+/,
          /^vite\s+/
        ];

        const isDevCommand = devPatterns.some(pattern => pattern.test(command));
        if (!isDevCommand) {
          return { valid: false, reason: `Command not recognized as safe: ${baseCommand}` };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Generate a unique command ID
   */
  private generateId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get running process count
   */
  getRunningCount(): number {
    return this.runningProcesses.size;
  }

  /**
   * Check if any processes are running
   */
  hasRunningProcesses(): boolean {
    return this.runningProcesses.size > 0;
  }
}

/**
 * Create a singleton terminal tool instance
 */
let terminalToolInstance: TerminalTool | null = null;

export function getTerminalTool(config?: TerminalToolConfig): TerminalTool {
  if (!terminalToolInstance) {
    terminalToolInstance = new TerminalTool(config);
  }
  return terminalToolInstance;
}

/**
 * Execute a single command (convenience function)
 */
export async function executeCommand(
  command: string,
  options?: Omit<TerminalCommand, 'command'>
): Promise<TerminalResult> {
  const tool = getTerminalTool();
  return tool.execute({ command, ...options });
}

export default TerminalTool;
