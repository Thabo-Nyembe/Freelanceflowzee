/**
 * VNC Streamer
 *
 * Provides live browser viewing via VNC/WebSocket streaming.
 * Allows real-time observation of browser automation.
 */

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import crypto from 'crypto';

export interface VNCConfig {
  displayNumber?: number;
  resolution?: string;
  colorDepth?: number;
  vncPort?: number;
  websocketPort?: number;
  password?: string;
}

export interface VNCSession {
  id: string;
  displayNumber: number;
  vncPort: number;
  websocketPort: number;
  status: 'starting' | 'running' | 'stopped' | 'error';
  createdAt: Date;
  url?: string;
}

export interface ScreenshotResult {
  success: boolean;
  data?: string; // Base64 PNG
  error?: string;
  timestamp: string;
}

const DEFAULT_CONFIG: VNCConfig = {
  displayNumber: 99,
  resolution: '1280x720',
  colorDepth: 24,
  vncPort: 5999,
  websocketPort: 6080
};

/**
 * VNC Streamer - Live browser viewing
 */
export class VNCStreamer extends EventEmitter {
  private config: VNCConfig;
  private sessions: Map<string, VNCSession> = new Map();
  private processes: Map<string, ChildProcess[]> = new Map();
  private currentDisplay: number;

  constructor(config: VNCConfig = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentDisplay = this.config.displayNumber!;
  }

  /**
   * Start a new VNC session
   */
  async startSession(): Promise<VNCSession> {
    const sessionId = crypto.randomBytes(8).toString('hex');
    const displayNumber = this.currentDisplay++;
    const vncPort = 5900 + displayNumber;
    const websocketPort = this.config.websocketPort! + (displayNumber - this.config.displayNumber!);

    const session: VNCSession = {
      id: sessionId,
      displayNumber,
      vncPort,
      websocketPort,
      status: 'starting',
      createdAt: new Date()
    };

    this.sessions.set(sessionId, session);
    this.processes.set(sessionId, []);

    try {
      // Start Xvfb (virtual framebuffer)
      await this.startXvfb(sessionId, displayNumber);

      // Start VNC server
      await this.startVNCServer(sessionId, displayNumber, vncPort);

      // Start websocket proxy (noVNC)
      await this.startWebsocketProxy(sessionId, vncPort, websocketPort);

      session.status = 'running';
      session.url = `ws://localhost:${websocketPort}`;

      this.emit('session:started', session);
      return session;
    } catch (error) {
      session.status = 'error';
      this.emit('session:error', { sessionId, error });
      throw error;
    }
  }

  /**
   * Start Xvfb virtual display
   */
  private startXvfb(sessionId: string, displayNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        `:${displayNumber}`,
        '-screen', '0', `${this.config.resolution}x${this.config.colorDepth}`,
        '-ac',
        '-nolisten', 'tcp'
      ];

      const proc = spawn('Xvfb', args);
      this.processes.get(sessionId)?.push(proc);

      proc.on('error', (error) => {
        reject(new Error(`Failed to start Xvfb: ${error.message}`));
      });

      // Give Xvfb time to start
      setTimeout(resolve, 500);
    });
  }

  /**
   * Start VNC server (x11vnc)
   */
  private startVNCServer(sessionId: string, displayNumber: number, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-display', `:${displayNumber}`,
        '-rfbport', port.toString(),
        '-shared',
        '-forever',
        '-nopw',
        '-xkb'
      ];

      if (this.config.password) {
        args.push('-passwd', this.config.password);
      }

      const proc = spawn('x11vnc', args);
      this.processes.get(sessionId)?.push(proc);

      proc.stdout?.on('data', (data) => {
        this.emit('vnc:log', { sessionId, data: data.toString() });
      });

      proc.stderr?.on('data', (data) => {
        const msg = data.toString();
        if (msg.includes('PORT=')) {
          resolve();
        }
      });

      proc.on('error', (error) => {
        reject(new Error(`Failed to start VNC server: ${error.message}`));
      });

      // Give VNC time to start
      setTimeout(resolve, 1000);
    });
  }

  /**
   * Start websocket proxy (websockify for noVNC)
   */
  private startWebsocketProxy(sessionId: string, vncPort: number, wsPort: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        wsPort.toString(),
        `localhost:${vncPort}`
      ];

      const proc = spawn('websockify', args);
      this.processes.get(sessionId)?.push(proc);

      proc.on('error', (error) => {
        // websockify might not be available, continue without it
        console.warn(`Websockify not available: ${error.message}`);
        resolve();
      });

      // Give websockify time to start
      setTimeout(resolve, 500);
    });
  }

  /**
   * Start a browser in the VNC session
   */
  async startBrowser(sessionId: string, url?: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'running') {
      throw new Error('VNC session not running');
    }

    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        DISPLAY: `:${session.displayNumber}`
      };

      const args = url ? [url] : [];
      const proc = spawn('chromium-browser', [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--window-size=1280,720',
        ...args
      ], { env });

      this.processes.get(sessionId)?.push(proc);

      proc.on('error', (error) => {
        // Try firefox if chromium not available
        const firefoxProc = spawn('firefox', args, { env });
        this.processes.get(sessionId)?.push(firefoxProc);

        firefoxProc.on('error', () => {
          reject(new Error('No browser available'));
        });

        setTimeout(resolve, 2000);
      });

      setTimeout(resolve, 2000);
    });
  }

  /**
   * Take a screenshot of the VNC session
   */
  async screenshot(sessionId: string): Promise<ScreenshotResult> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'running') {
      return {
        success: false,
        error: 'VNC session not running',
        timestamp: new Date().toISOString()
      };
    }

    return new Promise((resolve) => {
      const tempFile = `/tmp/screenshot-${sessionId}.png`;
      const env = {
        ...process.env,
        DISPLAY: `:${session.displayNumber}`
      };

      const proc = spawn('import', ['-window', 'root', tempFile], { env });

      proc.on('close', (code) => {
        if (code === 0) {
          // Read the file and convert to base64
          const fs = require('fs');
          try {
            const data = fs.readFileSync(tempFile);
            fs.unlinkSync(tempFile);
            resolve({
              success: true,
              data: data.toString('base64'),
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to read screenshot',
              timestamp: new Date().toISOString()
            });
          }
        } else {
          resolve({
            success: false,
            error: 'Screenshot capture failed',
            timestamp: new Date().toISOString()
          });
        }
      });

      proc.on('error', () => {
        resolve({
          success: false,
          error: 'Screenshot tool not available',
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  /**
   * Stop a VNC session
   */
  async stopSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Kill all processes
    const procs = this.processes.get(sessionId) || [];
    for (const proc of procs) {
      try {
        proc.kill('SIGTERM');
        setTimeout(() => proc.kill('SIGKILL'), 1000);
      } catch {
        // Ignore kill errors
      }
    }

    session.status = 'stopped';
    this.processes.delete(sessionId);
    this.emit('session:stopped', session);
  }

  /**
   * Get session info
   */
  getSession(sessionId: string): VNCSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List all sessions
   */
  getSessions(): VNCSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Cleanup all sessions
   */
  async cleanup(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys());
    for (const sessionId of sessionIds) {
      await this.stopSession(sessionId);
    }
    this.sessions.clear();
  }
}

/**
 * Create VNC streamer instance
 */
export function createVNCStreamer(config?: VNCConfig): VNCStreamer {
  return new VNCStreamer(config);
}

export default VNCStreamer;
