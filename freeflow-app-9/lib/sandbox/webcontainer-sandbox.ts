/**
 * WebContainer Sandbox
 *
 * Provides in-browser code execution using WebContainers.
 * Enables running Node.js in the browser without a server.
 */

export interface WebContainerFile {
  path: string;
  content: string;
}

export interface WebContainerConfig {
  rootDir?: string;
  env?: Record<string, string>;
}

export interface ProcessOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface WebContainerInstance {
  id: string;
  status: 'initializing' | 'ready' | 'running' | 'stopped' | 'error';
  url?: string;
  port?: number;
}

/**
 * WebContainer Manager - Client-side only
 * This module provides the interface for WebContainer operations.
 * Actual implementation runs in the browser using @webcontainer/api
 */
export class WebContainerManager {
  private instances: Map<string, WebContainerInstance> = new Map();
  private currentInstance: WebContainerInstance | null = null;

  /**
   * Boot a new WebContainer instance
   * Note: This must be called from client-side code
   */
  async boot(config: WebContainerConfig = {}): Promise<WebContainerInstance> {
    // Generate instance ID
    const instanceId = `wc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const instance: WebContainerInstance = {
      id: instanceId,
      status: 'initializing'
    };

    this.instances.set(instanceId, instance);
    this.currentInstance = instance;

    // The actual WebContainer boot happens in the browser
    // This is a server-side placeholder that returns the config
    return instance;
  }

  /**
   * Mount files to the WebContainer
   */
  async mountFiles(files: WebContainerFile[]): Promise<void> {
    if (!this.currentInstance) {
      throw new Error('No WebContainer instance. Call boot() first.');
    }

    // Convert files to WebContainer file system format
    // This is processed client-side
  }

  /**
   * Run a command in the WebContainer
   */
  async runCommand(command: string, args: string[] = []): Promise<ProcessOutput> {
    if (!this.currentInstance) {
      throw new Error('No WebContainer instance. Call boot() first.');
    }

    // Placeholder - actual execution happens client-side
    return {
      stdout: '',
      stderr: '',
      exitCode: 0
    };
  }

  /**
   * Start a development server
   */
  async startDevServer(port: number = 3000): Promise<string> {
    if (!this.currentInstance) {
      throw new Error('No WebContainer instance. Call boot() first.');
    }

    this.currentInstance.port = port;
    this.currentInstance.status = 'running';

    // URL will be provided by WebContainer runtime
    return `http://localhost:${port}`;
  }

  /**
   * Get current instance
   */
  getInstance(): WebContainerInstance | null {
    return this.currentInstance;
  }

  /**
   * Teardown WebContainer
   */
  async teardown(): Promise<void> {
    if (this.currentInstance) {
      this.currentInstance.status = 'stopped';
      this.instances.delete(this.currentInstance.id);
      this.currentInstance = null;
    }
  }
}

/**
 * WebContainer file system builder
 * Converts flat file list to WebContainer tree structure
 */
export function buildFileSystemTree(files: WebContainerFile[]): Record<string, unknown> {
  const tree: Record<string, unknown> = {};

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      current = (current[part] as { directory: Record<string, unknown> }).directory;
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = {
      file: {
        contents: file.content
      }
    };
  }

  return tree;
}

/**
 * Generate package.json for a project
 */
export function generatePackageJson(options: {
  name: string;
  framework?: 'nextjs' | 'react' | 'vue' | 'express';
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): string {
  const basePackage = {
    name: options.name,
    version: '1.0.0',
    private: true,
    scripts: {} as Record<string, string>,
    dependencies: {} as Record<string, string>,
    devDependencies: {} as Record<string, string>
  };

  switch (options.framework) {
    case 'nextjs':
      basePackage.scripts = {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      };
      basePackage.dependencies = {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        ...options.dependencies
      };
      basePackage.devDependencies = {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        typescript: '^5.0.0',
        ...options.devDependencies
      };
      break;

    case 'react':
      basePackage.scripts = {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      };
      basePackage.dependencies = {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        ...options.dependencies
      };
      basePackage.devDependencies = {
        '@vitejs/plugin-react': '^4.0.0',
        vite: '^5.0.0',
        ...options.devDependencies
      };
      break;

    case 'vue':
      basePackage.scripts = {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      };
      basePackage.dependencies = {
        vue: '^3.3.0',
        ...options.dependencies
      };
      basePackage.devDependencies = {
        '@vitejs/plugin-vue': '^4.0.0',
        vite: '^5.0.0',
        ...options.devDependencies
      };
      break;

    case 'express':
      basePackage.scripts = {
        start: 'node index.js',
        dev: 'nodemon index.js'
      };
      basePackage.dependencies = {
        express: '^4.18.0',
        ...options.dependencies
      };
      basePackage.devDependencies = {
        nodemon: '^3.0.0',
        ...options.devDependencies
      };
      break;

    default:
      basePackage.scripts = {
        start: 'node index.js'
      };
      basePackage.dependencies = options.dependencies || {};
      basePackage.devDependencies = options.devDependencies || {};
  }

  return JSON.stringify(basePackage, null, 2);
}

/**
 * Client-side WebContainer hook configuration
 * This is the actual implementation that runs in the browser
 */
export const WEBCONTAINER_CLIENT_CODE = `
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null;

export async function bootWebContainer() {
  if (!webcontainerInstance) {
    webcontainerInstance = await WebContainer.boot();
  }
  return webcontainerInstance;
}

export async function mountFiles(files) {
  const container = await bootWebContainer();
  await container.mount(files);
}

export async function runCommand(command, args = []) {
  const container = await bootWebContainer();
  const process = await container.spawn(command, args);

  const output = { stdout: '', stderr: '', exitCode: 0 };

  process.output.pipeTo(new WritableStream({
    write(data) {
      output.stdout += data;
    }
  }));

  output.exitCode = await process.exit;
  return output;
}

export async function startDevServer(port = 3000) {
  const container = await bootWebContainer();

  // Install dependencies
  await runCommand('npm', ['install']);

  // Start dev server
  const serverProcess = await container.spawn('npm', ['run', 'dev']);

  return new Promise((resolve) => {
    container.on('server-ready', (port, url) => {
      resolve(url);
    });
  });
}

export async function teardown() {
  if (webcontainerInstance) {
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
}
`;

export default WebContainerManager;
