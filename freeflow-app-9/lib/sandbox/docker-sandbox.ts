/**
 * Docker Sandbox
 *
 * Provides isolated Docker container execution for AI agent tasks.
 * Each task runs in its own container with resource limits and security isolation.
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface DockerSandboxConfig {
  image?: string;
  memoryLimit?: string;
  cpuLimit?: string;
  timeout?: number;
  workDir?: string;
  network?: 'none' | 'bridge' | 'host';
  volumeMounts?: Array<{ hostPath: string; containerPath: string; readOnly?: boolean }>;
  environment?: Record<string, string>;
  user?: string;
}

export interface SandboxExecResult {
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  duration: number;
  containerId?: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  status: 'created' | 'running' | 'paused' | 'stopped' | 'removing';
  createdAt: Date;
  image: string;
}

const DEFAULT_CONFIG: DockerSandboxConfig = {
  image: 'node:20-alpine',
  memoryLimit: '512m',
  cpuLimit: '1.0',
  timeout: 300000, // 5 minutes
  workDir: '/app',
  network: 'none',
  user: 'node'
};

/**
 * Docker Sandbox - Isolated container execution
 */
export class DockerSandbox extends EventEmitter {
  private config: DockerSandboxConfig;
  private containers: Map<string, ContainerInfo> = new Map();
  private isDockerAvailable: boolean | null = null;

  constructor(config: DockerSandboxConfig = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if Docker is available
   */
  async checkDocker(): Promise<boolean> {
    if (this.isDockerAvailable !== null) {
      return this.isDockerAvailable;
    }

    return new Promise((resolve) => {
      const proc = spawn('docker', ['version'], { shell: true });
      proc.on('close', (code) => {
        this.isDockerAvailable = code === 0;
        resolve(this.isDockerAvailable);
      });
      proc.on('error', () => {
        this.isDockerAvailable = false;
        resolve(false);
      });
    });
  }

  /**
   * Create a new sandbox container
   */
  async createContainer(name?: string): Promise<string> {
    const available = await this.checkDocker();
    if (!available) {
      throw new Error('Docker is not available on this system');
    }

    const containerName = name || `sandbox-${crypto.randomBytes(8).toString('hex')}`;
    const args = this.buildDockerRunArgs(containerName);

    return new Promise((resolve, reject) => {
      const proc = spawn('docker', ['create', ...args, this.config.image!, 'tail', '-f', '/dev/null'], {
        shell: true
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => { stdout += data.toString(); });
      proc.stderr?.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (code === 0) {
          const containerId = stdout.trim().substring(0, 12);
          this.containers.set(containerId, {
            id: containerId,
            name: containerName,
            status: 'created',
            createdAt: new Date(),
            image: this.config.image!
          });
          resolve(containerId);
        } else {
          reject(new Error(`Failed to create container: ${stderr}`));
        }
      });
    });
  }

  /**
   * Start a container
   */
  async startContainer(containerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('docker', ['start', containerId], { shell: true });

      proc.on('close', (code) => {
        if (code === 0) {
          const container = this.containers.get(containerId);
          if (container) {
            container.status = 'running';
          }
          resolve();
        } else {
          reject(new Error(`Failed to start container: ${containerId}`));
        }
      });
    });
  }

  /**
   * Execute a command in the container
   */
  async exec(containerId: string, command: string, options?: { timeout?: number }): Promise<SandboxExecResult> {
    const startTime = Date.now();
    const timeout = options?.timeout || this.config.timeout!;

    return new Promise((resolve) => {
      const proc = spawn('docker', ['exec', containerId, 'sh', '-c', command], {
        shell: true
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      const timeoutHandle = setTimeout(() => {
        killed = true;
        proc.kill('SIGKILL');
      }, timeout);

      proc.stdout?.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        this.emit('stdout', { containerId, data: chunk });
      });

      proc.stderr?.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        this.emit('stderr', { containerId, data: chunk });
      });

      proc.on('close', (code) => {
        clearTimeout(timeoutHandle);
        resolve({
          success: code === 0 && !killed,
          exitCode: code,
          stdout,
          stderr: killed ? `Command timed out after ${timeout}ms` : stderr,
          duration: Date.now() - startTime,
          containerId
        });
      });

      proc.on('error', (error) => {
        clearTimeout(timeoutHandle);
        resolve({
          success: false,
          exitCode: 1,
          stdout,
          stderr: error.message,
          duration: Date.now() - startTime,
          containerId
        });
      });
    });
  }

  /**
   * Copy files into the container
   */
  async copyToContainer(containerId: string, localPath: string, containerPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('docker', ['cp', localPath, `${containerId}:${containerPath}`], {
        shell: true
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to copy files to container`));
        }
      });
    });
  }

  /**
   * Copy files from the container
   */
  async copyFromContainer(containerId: string, containerPath: string, localPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('docker', ['cp', `${containerId}:${containerPath}`, localPath], {
        shell: true
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to copy files from container`));
        }
      });
    });
  }

  /**
   * Stop a container
   */
  async stopContainer(containerId: string, timeout: number = 10): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('docker', ['stop', '-t', timeout.toString(), containerId], {
        shell: true
      });

      proc.on('close', (code) => {
        if (code === 0) {
          const container = this.containers.get(containerId);
          if (container) {
            container.status = 'stopped';
          }
          resolve();
        } else {
          reject(new Error(`Failed to stop container: ${containerId}`));
        }
      });
    });
  }

  /**
   * Remove a container
   */
  async removeContainer(containerId: string, force: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = force ? ['rm', '-f', containerId] : ['rm', containerId];
      const proc = spawn('docker', args, { shell: true });

      proc.on('close', (code) => {
        if (code === 0) {
          this.containers.delete(containerId);
          resolve();
        } else {
          reject(new Error(`Failed to remove container: ${containerId}`));
        }
      });
    });
  }

  /**
   * Run a command in a new ephemeral container
   */
  async run(command: string, options?: { image?: string; timeout?: number }): Promise<SandboxExecResult> {
    const startTime = Date.now();
    const image = options?.image || this.config.image!;
    const timeout = options?.timeout || this.config.timeout!;

    const args = [
      'run',
      '--rm',
      '--memory', this.config.memoryLimit!,
      '--cpus', this.config.cpuLimit!,
      '--network', this.config.network!,
      '--workdir', this.config.workDir!,
      '--user', this.config.user!,
      image,
      'sh', '-c', command
    ];

    return new Promise((resolve) => {
      const proc = spawn('docker', args, { shell: true });

      let stdout = '';
      let stderr = '';
      let killed = false;

      const timeoutHandle = setTimeout(() => {
        killed = true;
        proc.kill('SIGKILL');
      }, timeout);

      proc.stdout?.on('data', (data) => { stdout += data.toString(); });
      proc.stderr?.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        clearTimeout(timeoutHandle);
        resolve({
          success: code === 0 && !killed,
          exitCode: code,
          stdout,
          stderr: killed ? `Command timed out after ${timeout}ms` : stderr,
          duration: Date.now() - startTime
        });
      });

      proc.on('error', (error) => {
        clearTimeout(timeoutHandle);
        resolve({
          success: false,
          exitCode: 1,
          stdout,
          stderr: error.message,
          duration: Date.now() - startTime
        });
      });
    });
  }

  /**
   * Build docker run arguments
   */
  private buildDockerRunArgs(name: string): string[] {
    const args: string[] = [
      '--name', name,
      '--memory', this.config.memoryLimit!,
      '--cpus', this.config.cpuLimit!,
      '--network', this.config.network!,
      '--workdir', this.config.workDir!,
      '--user', this.config.user!
    ];

    // Add volume mounts
    if (this.config.volumeMounts) {
      for (const mount of this.config.volumeMounts) {
        const ro = mount.readOnly ? ':ro' : '';
        args.push('-v', `${mount.hostPath}:${mount.containerPath}${ro}`);
      }
    }

    // Add environment variables
    if (this.config.environment) {
      for (const [key, value] of Object.entries(this.config.environment)) {
        args.push('-e', `${key}=${value}`);
      }
    }

    return args;
  }

  /**
   * List active containers
   */
  getContainers(): ContainerInfo[] {
    return Array.from(this.containers.values());
  }

  /**
   * Cleanup all containers
   */
  async cleanup(): Promise<void> {
    const containers = Array.from(this.containers.keys());
    for (const containerId of containers) {
      try {
        await this.removeContainer(containerId, true);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Create Docker sandbox instance
 */
export function createDockerSandbox(config?: DockerSandboxConfig): DockerSandbox {
  return new DockerSandbox(config);
}

export default DockerSandbox;
