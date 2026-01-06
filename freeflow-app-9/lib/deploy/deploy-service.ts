/**
 * Deploy Service
 *
 * Provides one-click deployment to Vercel, Netlify, and other platforms.
 * Handles project packaging, uploading, and deployment tracking.
 */

export type DeployProvider = 'vercel' | 'netlify' | 'railway' | 'render';

export interface DeployConfig {
  provider: DeployProvider;
  projectName: string;
  framework?: 'nextjs' | 'react' | 'vue' | 'static';
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  environmentVariables?: Record<string, string>;
  regions?: string[];
}

export interface DeployResult {
  success: boolean;
  deploymentId?: string;
  url?: string;
  previewUrl?: string;
  status: 'queued' | 'building' | 'ready' | 'error' | 'cancelled';
  error?: string;
  logs?: string[];
  createdAt: string;
  readyAt?: string;
}

export interface ProjectFiles {
  files: Array<{
    path: string;
    content: string;
    encoding?: 'utf-8' | 'base64';
  }>;
}

/**
 * Deploy Service - One-click deployments
 */
export class DeployService {
  private vercelToken?: string;
  private netlifyToken?: string;
  private railwayToken?: string;
  private renderToken?: string;

  constructor() {
    this.vercelToken = process.env.VERCEL_TOKEN;
    this.netlifyToken = process.env.NETLIFY_TOKEN;
    this.railwayToken = process.env.RAILWAY_TOKEN;
    this.renderToken = process.env.RENDER_TOKEN;
  }

  /**
   * Deploy project to specified provider
   */
  async deploy(config: DeployConfig, files: ProjectFiles): Promise<DeployResult> {
    switch (config.provider) {
      case 'vercel':
        return this.deployToVercel(config, files);
      case 'netlify':
        return this.deployToNetlify(config, files);
      case 'railway':
        return this.deployToRailway(config, files);
      case 'render':
        return this.deployToRender(config, files);
      default:
        return {
          success: false,
          status: 'error',
          error: `Unknown provider: ${config.provider}`,
          createdAt: new Date().toISOString()
        };
    }
  }

  /**
   * Deploy to Vercel
   */
  private async deployToVercel(config: DeployConfig, files: ProjectFiles): Promise<DeployResult> {
    if (!this.vercelToken) {
      return {
        success: false,
        status: 'error',
        error: 'Vercel token not configured',
        createdAt: new Date().toISOString()
      };
    }

    try {
      // Create deployment
      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vercelToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.projectName,
          files: files.files.map(f => ({
            file: f.path,
            data: f.encoding === 'base64' ? f.content : Buffer.from(f.content).toString('base64'),
            encoding: 'base64'
          })),
          projectSettings: {
            framework: config.framework === 'nextjs' ? 'nextjs' : null,
            buildCommand: config.buildCommand,
            outputDirectory: config.outputDirectory,
            installCommand: config.installCommand
          },
          env: config.environmentVariables
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: 'error',
          error: data.error?.message || 'Vercel deployment failed',
          createdAt: new Date().toISOString()
        };
      }

      return {
        success: true,
        deploymentId: data.id,
        url: `https://${data.url}`,
        previewUrl: data.inspectorUrl,
        status: data.readyState === 'READY' ? 'ready' : 'building',
        createdAt: new Date().toISOString(),
        readyAt: data.ready ? new Date(data.ready).toISOString() : undefined
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Vercel deployment failed',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Deploy to Netlify
   */
  private async deployToNetlify(config: DeployConfig, files: ProjectFiles): Promise<DeployResult> {
    if (!this.netlifyToken) {
      return {
        success: false,
        status: 'error',
        error: 'Netlify token not configured',
        createdAt: new Date().toISOString()
      };
    }

    try {
      // Create site if needed and deploy
      const zipBuffer = await this.createZipFromFiles(files);

      // Create a new site
      const siteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.netlifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        })
      });

      const siteData = await siteResponse.json();

      if (!siteResponse.ok && siteData.code !== 422) { // 422 = site exists
        return {
          success: false,
          status: 'error',
          error: siteData.message || 'Failed to create Netlify site',
          createdAt: new Date().toISOString()
        };
      }

      const siteId = siteData.id || siteData.site_id;

      // Deploy files
      const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.netlifyToken}`,
          'Content-Type': 'application/zip'
        },
        body: zipBuffer
      });

      const deployData = await deployResponse.json();

      if (!deployResponse.ok) {
        return {
          success: false,
          status: 'error',
          error: deployData.message || 'Netlify deployment failed',
          createdAt: new Date().toISOString()
        };
      }

      return {
        success: true,
        deploymentId: deployData.id,
        url: deployData.ssl_url || deployData.url,
        previewUrl: deployData.deploy_ssl_url,
        status: deployData.state === 'ready' ? 'ready' : 'building',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Netlify deployment failed',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Deploy to Railway
   */
  private async deployToRailway(config: DeployConfig, files: ProjectFiles): Promise<DeployResult> {
    if (!this.railwayToken) {
      return {
        success: false,
        status: 'error',
        error: 'Railway token not configured',
        createdAt: new Date().toISOString()
      };
    }

    try {
      // Railway uses GraphQL API
      const response = await fetch('https://backboard.railway.app/graphql/v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.railwayToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            mutation DeployFromTemplate($input: DeployInput!) {
              deployFromRepo(input: $input) {
                id
                staticUrl
                status
              }
            }
          `,
          variables: {
            input: {
              name: config.projectName,
              repo: null // Direct deploy without repo
            }
          }
        })
      });

      const data = await response.json();

      if (data.errors) {
        return {
          success: false,
          status: 'error',
          error: data.errors[0]?.message || 'Railway deployment failed',
          createdAt: new Date().toISOString()
        };
      }

      const deployment = data.data?.deployFromRepo;
      return {
        success: true,
        deploymentId: deployment?.id,
        url: deployment?.staticUrl,
        status: deployment?.status === 'SUCCESS' ? 'ready' : 'building',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Railway deployment failed',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Deploy to Render
   */
  private async deployToRender(config: DeployConfig, files: ProjectFiles): Promise<DeployResult> {
    if (!this.renderToken) {
      return {
        success: false,
        status: 'error',
        error: 'Render token not configured',
        createdAt: new Date().toISOString()
      };
    }

    try {
      // Create static site
      const response = await fetch('https://api.render.com/v1/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.renderToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'static_site',
          name: config.projectName,
          buildCommand: config.buildCommand || 'npm run build',
          publishPath: config.outputDirectory || 'dist',
          envVars: Object.entries(config.environmentVariables || {}).map(([key, value]) => ({
            key,
            value
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: 'error',
          error: data.message || 'Render deployment failed',
          createdAt: new Date().toISOString()
        };
      }

      return {
        success: true,
        deploymentId: data.id,
        url: data.serviceDetails?.url,
        status: 'building',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Render deployment failed',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(provider: DeployProvider, deploymentId: string): Promise<DeployResult> {
    switch (provider) {
      case 'vercel':
        return this.getVercelStatus(deploymentId);
      case 'netlify':
        return this.getNetlifyStatus(deploymentId);
      default:
        return {
          success: false,
          status: 'error',
          error: 'Status check not implemented for this provider',
          createdAt: new Date().toISOString()
        };
    }
  }

  private async getVercelStatus(deploymentId: string): Promise<DeployResult> {
    try {
      const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.vercelToken}`
        }
      });

      const data = await response.json();

      return {
        success: data.readyState === 'READY',
        deploymentId,
        url: `https://${data.url}`,
        status: data.readyState === 'READY' ? 'ready' :
                data.readyState === 'ERROR' ? 'error' :
                data.readyState === 'CANCELED' ? 'cancelled' : 'building',
        error: data.error?.message,
        createdAt: new Date(data.createdAt).toISOString(),
        readyAt: data.ready ? new Date(data.ready).toISOString() : undefined
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get status',
        createdAt: new Date().toISOString()
      };
    }
  }

  private async getNetlifyStatus(deploymentId: string): Promise<DeployResult> {
    try {
      const response = await fetch(`https://api.netlify.com/api/v1/deploys/${deploymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.netlifyToken}`
        }
      });

      const data = await response.json();

      return {
        success: data.state === 'ready',
        deploymentId,
        url: data.ssl_url || data.url,
        status: data.state === 'ready' ? 'ready' :
                data.state === 'error' ? 'error' : 'building',
        error: data.error_message,
        createdAt: new Date(data.created_at).toISOString(),
        readyAt: data.published_at ? new Date(data.published_at).toISOString() : undefined
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get status',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * Create ZIP archive from files
   */
  private async createZipFromFiles(files: ProjectFiles): Promise<Buffer> {
    // Simple implementation - in production, use a proper zip library
    const JSZip = require('jszip');
    const zip = new JSZip();

    for (const file of files.files) {
      const content = file.encoding === 'base64'
        ? Buffer.from(file.content, 'base64')
        : file.content;
      zip.file(file.path, content);
    }

    return zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(provider: DeployProvider): boolean {
    switch (provider) {
      case 'vercel':
        return !!this.vercelToken;
      case 'netlify':
        return !!this.netlifyToken;
      case 'railway':
        return !!this.railwayToken;
      case 'render':
        return !!this.renderToken;
      default:
        return false;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): DeployProvider[] {
    const providers: DeployProvider[] = [];
    if (this.vercelToken) providers.push('vercel');
    if (this.netlifyToken) providers.push('netlify');
    if (this.railwayToken) providers.push('railway');
    if (this.renderToken) providers.push('render');
    return providers;
  }
}

/**
 * Create deploy service instance
 */
let deployServiceInstance: DeployService | null = null;

export function getDeployService(): DeployService {
  if (!deployServiceInstance) {
    deployServiceInstance = new DeployService();
  }
  return deployServiceInstance;
}

export default DeployService;
