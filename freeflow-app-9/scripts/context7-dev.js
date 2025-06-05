#!/usr/bin/env node

/**
 * Context7 Enhanced Development Script for FreeflowZee
 * 
 * This script integrates Context7 MCP server to provide up-to-date
 * documentation and code examples while developing.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class Context7Dev {
  constructor() {
    this.configPath = path.join(process.cwd(), '.context7/config.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load Context7 config:', error.message);
      return null;
    }
  }

  async startMCPServer() {
    console.log('🚀 Starting Context7 MCP Server...');
    
    const { command, args, env } = this.config.mcpServers.context7;
    
    const mcpProcess = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: 'pipe'
    });

    mcpProcess.stdout.on('data', (data) => {
      console.log(`[Context7 MCP] ${data.toString().trim()}`);
    });

    mcpProcess.stderr.on('data', (data) => {
      console.error(`[Context7 MCP Error] ${data.toString().trim()}`);
    });

    return mcpProcess;
  }

  async startDevServer() {
    console.log('🔥 Starting Next.js Development Server...');
    
    const devProcess = spawn('pnpm', ['dev'], {
      stdio: 'inherit'
    });

    return devProcess;
  }

  async queryLibraryDocs(libraryName, topic = '') {
    console.log(`📚 Fetching documentation for ${libraryName}${topic ? ` - ${topic}` : ''}...`);
    
    // This would integrate with Context7 API to fetch docs
    // For now, we'll just log the request
    console.log(`[Context7] Query: Library=${libraryName}, Topic=${topic}`);
  }

  printWelcome() {
    console.log(`
╭──────────────────────────────────────────────────────────────╮
│                     🎯 FreeflowZee + Context7                │
│                                                              │
│  Enhanced Development Environment with Up-to-Date Docs      │
│                                                              │
│  Available Commands:                                         │
│  • pnpm context7:docs <library> [topic] - Get docs          │
│  • pnpm context7:examples <library> - Get code examples     │
│  • pnpm context7:search <query> - Search across libraries   │
│                                                              │
│  Configured Libraries:                                       │
│  ${this.config.libraries.slice(0, 3).join(', ')}${this.config.libraries.length > 3 ? '...' : ''}       │
╰──────────────────────────────────────────────────────────────╯
    `);
  }

  async start() {
    if (!this.config) {
      console.error('❌ Context7 configuration not found. Please run setup first.');
      process.exit(1);
    }

    this.printWelcome();

    try {
      // Start MCP server in background
      const mcpProcess = await this.startMCPServer();
      
      // Give MCP server time to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start development server
      const devProcess = await this.startDevServer();

      // Handle cleanup
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down Context7 Enhanced Development...');
        mcpProcess.kill('SIGTERM');
        devProcess.kill('SIGTERM');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to start enhanced development environment:', error.message);
      process.exit(1);
    }
  }
}

// CLI handling
const command = process.argv[2];
const library = process.argv[3];
const topic = process.argv[4];

const context7Dev = new Context7Dev();

switch (command) {
  case 'start':
    context7Dev.start();
    break;
  case 'docs':
    if (!library) {
      console.error('Usage: node context7-dev.js docs <library> [topic]');
      process.exit(1);
    }
    context7Dev.queryLibraryDocs(library, topic);
    break;
  default:
    console.log('Usage: node context7-dev.js <start|docs> [options]');
    console.log('  start              - Start enhanced development environment');
    console.log('  docs <lib> [topic] - Get documentation for library');
} 