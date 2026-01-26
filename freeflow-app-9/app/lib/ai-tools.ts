import { tool } from 'ai';
import { z } from 'zod';
import { createFeatureLogger } from '@/lib/logger';
import { createProject as createProjectAction } from '@/app/actions/projects';
import { createFile as createFileAction } from '@/app/actions/files';
import { createEscrowDeposit } from '@/lib/escrow-queries';
import { getAnalyticsOverview, getAnalyticsMetrics } from '@/lib/analytics-queries';
import { createAsset as createAIAsset, createGeneration } from '@/lib/ai-create-queries';
import { createClient } from '@/lib/supabase/client';

const logger = createFeatureLogger('AI-Tools');

// 1. Project Creation Tool
export const createProjectTool = tool({
  description: 'Create a new project in the Projects Hub',
  parameters: z.object({
    name: z.string().describe('Project name'),
    description: z.string().describe('Project description'),
  }),
  generate: async function*({ name, description }) {
    logger.info('AI tool: Creating project', { name, description });

    try {
      const result = await createProjectAction({
        name,
        description,
        status: 'draft',
        priority: 'medium'
      });

      if (!result.success) {
        logger.error('AI tool: Failed to create project', { error: result.error });
        yield {
          success: false,
          error: result.error || 'Failed to create project',
        };
        return;
      }

      logger.info('AI tool: Project created successfully', {
        projectId: result.data?.id,
        name: result.data?.name
      });

      yield {
        success: true,
        projectId: result.data?.id,
        projectName: result.data?.name,
        message: result.message || 'Project created successfully'
      };
    } catch (error) {
      logger.error('AI tool: Unexpected error creating project', { error });
      yield {
        success: false,
        error: 'An unexpected error occurred while creating the project',
      };
    }
  },
});

// 2. File Upload Tool
export const uploadFileTool = tool({
  description: 'Upload a file to the Files Hub',
  parameters: z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    path: z.string().optional().describe('Storage path for the file'),
    url: z.string().optional().describe('URL if file is already uploaded to storage'),
    projectId: z.string().optional().describe('Optional project ID to associate with'),
    folderId: z.string().optional().describe('Optional folder ID to place file in'),
  }),
  generate: async function*({ fileName, fileType, fileSize, path, url, projectId, folderId }) {
    logger.info('AI tool: Creating file record', {
      fileName,
      fileType,
      fileSize,
      fileSizeKB: (fileSize / 1024).toFixed(2)
    });

    try {
      // Determine file type category
      let type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other' = 'other';
      const mimeType = fileType.toLowerCase();
      if (mimeType.startsWith('image/')) type = 'image';
      else if (mimeType.startsWith('video/')) type = 'video';
      else if (mimeType.startsWith('audio/')) type = 'audio';
      else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) type = 'document';
      else if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) type = 'archive';

      const result = await createFileAction({
        name: fileName,
        original_name: fileName,
        mime_type: fileType,
        size: fileSize,
        type,
        path: path || `uploads/${Date.now()}_${fileName}`,
        url: url || null,
        project_id: projectId || null,
        folder_id: folderId || null,
      });

      if (!result.success) {
        logger.error('AI tool: Failed to create file record', { error: result.error });
        yield {
          success: false,
          error: result.error || 'Failed to create file record',
        };
        return;
      }

      logger.info('AI tool: File record created successfully', {
        fileId: result.data?.id,
        fileName: result.data?.name
      });

      yield {
        success: true,
        fileId: result.data?.id,
        fileName: result.data?.name,
        fileUrl: result.data?.url,
        message: result.message || 'File record created successfully'
      };
    } catch (error) {
      logger.error('AI tool: Unexpected error creating file record', { error });
      yield {
        success: false,
        error: 'An unexpected error occurred while creating the file record',
      };
    }
  },
});

// 3. AI Asset Generation Tool
export const generateAIAssetTool = tool({
  description: 'Generate an AI-powered creative asset (e.g., LUT, preset, design)',
  parameters: z.object({
    assetType: z.string().describe('Type of asset to generate (luts, presets, templates, filters, etc.)'),
    prompt: z.string().describe('Description or prompt for the asset'),
    creativeField: z.string().optional().describe('Creative field (photography, videography, ui-ux-design, graphic-design, etc.)'),
    style: z.string().optional().describe('Style preset (modern, vintage, minimalist, bold, elegant, playful, professional, artistic)'),
    colorScheme: z.string().optional().describe('Color scheme (vibrant, muted, monochrome, pastel, dark, light, warm, cool)'),
  }),
  generate: async function*({ assetType, prompt, creativeField, style, colorScheme }) {
    logger.info('AI tool: Generating AI asset', {
      assetType,
      prompt,
      promptLength: prompt.length,
      creativeField,
      style,
      colorScheme
    });

    try {
      // Get current user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.error('AI tool: User not authenticated for AI asset generation');
        yield {
          success: false,
          error: 'User must be authenticated to generate AI assets',
        };
        return;
      }

      // Map asset type to valid enum
      const validAssetTypes = ['luts', 'presets', 'actions', 'overlays', 'templates', 'filters', 'transitions', 'effects'];
      const normalizedAssetType = assetType.toLowerCase().replace(/[^a-z-]/g, '');
      const mappedAssetType = validAssetTypes.includes(normalizedAssetType)
        ? normalizedAssetType as 'luts' | 'presets' | 'templates' | 'filters'
        : 'templates';

      // Map creative field
      const validFields = ['photography', 'videography', 'ui-ux-design', 'graphic-design', 'music-production', 'web-development'];
      const mappedField = (creativeField && validFields.includes(creativeField.toLowerCase()))
        ? creativeField.toLowerCase() as 'photography' | 'videography' | 'ui-ux-design' | 'graphic-design'
        : 'graphic-design';

      // Map style
      const validStyles = ['modern', 'vintage', 'minimalist', 'bold', 'elegant', 'playful', 'professional', 'artistic'];
      const mappedStyle = (style && validStyles.includes(style.toLowerCase()))
        ? style.toLowerCase() as 'modern' | 'vintage' | 'minimalist' | 'bold' | 'elegant' | 'playful' | 'professional' | 'artistic'
        : undefined;

      // Map color scheme
      const validColorSchemes = ['vibrant', 'muted', 'monochrome', 'pastel', 'dark', 'light', 'warm', 'cool'];
      const mappedColorScheme = (colorScheme && validColorSchemes.includes(colorScheme.toLowerCase()))
        ? colorScheme.toLowerCase() as 'vibrant' | 'muted' | 'monochrome' | 'pastel' | 'dark' | 'light' | 'warm' | 'cool'
        : undefined;

      // Create a generation record
      const generationResult = await createGeneration(user.id, {
        creative_field: mappedField,
        asset_type: mappedAssetType,
        style: mappedStyle,
        color_scheme: mappedColorScheme,
        custom_prompt: prompt,
        model_used: 'claude-3',
        batch_mode: false,
        assets_requested: 1,
        generation_params: { source: 'ai-tools' }
      });

      if (generationResult.error) {
        logger.error('AI tool: Failed to create generation record', { error: generationResult.error });
        yield {
          success: false,
          error: 'Failed to create generation record',
        };
        return;
      }

      // Create the asset record
      const assetResult = await createAIAsset(user.id, {
        name: `AI Generated ${assetType} - ${new Date().toLocaleDateString()}`,
        description: prompt,
        creative_field: mappedField,
        asset_type: mappedAssetType,
        format: 'png',
        style: mappedStyle,
        color_scheme: mappedColorScheme,
        custom_prompt: prompt,
        model_used: 'claude-3',
        tags: [assetType, 'ai-generated'],
        generation_params: { source: 'ai-tools', generationId: generationResult.data?.id }
      });

      if (assetResult.error) {
        logger.error('AI tool: Failed to create asset', { error: assetResult.error });
        yield {
          success: false,
          error: 'Failed to create asset record',
        };
        return;
      }

      logger.info('AI tool: AI asset created successfully', {
        assetId: assetResult.data?.id,
        generationId: generationResult.data?.id
      });

      yield {
        success: true,
        assetId: assetResult.data?.id,
        generationId: generationResult.data?.id,
        assetName: assetResult.data?.name,
        downloadUrl: assetResult.data?.file_url,
        previewUrl: assetResult.data?.preview_url,
        message: 'AI asset generation initiated successfully'
      };
    } catch (error) {
      logger.error('AI tool: Unexpected error generating AI asset', { error });
      yield {
        success: false,
        error: 'An unexpected error occurred while generating the AI asset',
      };
    }
  },
});

// 4. Escrow Deposit Creation Tool
export const createEscrowDepositTool = tool({
  description: 'Create a new escrow deposit for a project',
  parameters: z.object({
    projectTitle: z.string().describe('Title of the project'),
    clientName: z.string().describe('Name of the client'),
    clientEmail: z.string().describe('Email of the client'),
    amount: z.number().describe('Deposit amount in USD'),
    projectDescription: z.string().optional().describe('Project description'),
    paymentMethod: z.string().optional().describe('Payment method (stripe, paypal, bank_transfer, crypto)'),
    notes: z.string().optional().describe('Additional notes'),
  }),
  generate: async function*({ projectTitle, clientName, clientEmail, amount, projectDescription, paymentMethod, notes }) {
    logger.info('AI tool: Creating escrow deposit', {
      projectTitle,
      clientName,
      clientEmail,
      amount,
      paymentMethod: paymentMethod || 'stripe'
    });

    try {
      // Generate a secure completion password
      const completionPassword = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Map payment method
      const validPaymentMethods = ['stripe', 'paypal', 'bank_transfer', 'crypto', 'wire_transfer', 'credit_card'];
      const mappedPaymentMethod = (paymentMethod && validPaymentMethods.includes(paymentMethod.toLowerCase()))
        ? paymentMethod.toLowerCase() as 'stripe' | 'paypal' | 'bank_transfer' | 'crypto'
        : 'stripe';

      const deposit = await createEscrowDeposit({
        project_title: projectTitle,
        project_description: projectDescription,
        client_name: clientName,
        client_email: clientEmail,
        amount,
        currency: 'USD',
        payment_method: mappedPaymentMethod,
        completion_password: completionPassword,
        notes: notes
      });

      logger.info('AI tool: Escrow deposit created successfully', {
        depositId: deposit.id,
        status: deposit.status
      });

      yield {
        success: true,
        depositId: deposit.id,
        status: deposit.status,
        amount: deposit.amount,
        currency: deposit.currency,
        completionPassword: completionPassword,
        message: 'Escrow deposit created successfully. Keep the completion password safe!'
      };
    } catch (error) {
      logger.error('AI tool: Failed to create escrow deposit', { error });
      yield {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escrow deposit',
      };
    }
  },
});

// 5. Analytics Summary Tool
export const analyticsSummaryTool = tool({
  description: 'Get a summary of recent analytics (projects, revenue, users, etc.)',
  parameters: z.object({
    timeRange: z.string().optional().describe('Time range for analytics (day, week, month, quarter, year)'),
  }),
  generate: async function*({ timeRange }) {
    logger.info('AI tool: Fetching analytics summary', { timeRange: timeRange || 'month' });

    try {
      // Get current user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.error('AI tool: User not authenticated for analytics');
        yield {
          success: false,
          error: 'User must be authenticated to access analytics',
        };
        return;
      }

      // Get analytics overview
      const overviewResult = await getAnalyticsOverview(user.id);

      if (overviewResult.error || !overviewResult.data) {
        logger.warn('AI tool: Could not fetch full analytics, returning partial data');
        // Return basic metrics even if full analytics fails
        yield {
          success: true,
          totalProjects: 0,
          activeProjects: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          revenueGrowth: 0,
          totalClients: 0,
          newClients: 0,
          clientGrowth: 0,
          efficiency: 0,
          billableHours: 0,
          message: 'Analytics data unavailable or still being computed'
        };
        return;
      }

      const overview = overviewResult.data;

      // Also try to get detailed metrics
      const mappedTimeRange = timeRange === 'day' ? 'day'
        : timeRange === 'week' ? 'week'
        : timeRange === 'quarter' ? 'quarter'
        : timeRange === 'year' ? 'year'
        : 'month';

      const metricsResult = await getAnalyticsMetrics(user.id, mappedTimeRange);

      logger.info('AI tool: Analytics summary fetched successfully', {
        totalProjects: overview.totalProjects,
        totalRevenue: overview.totalRevenue
      });

      yield {
        success: true,
        totalProjects: overview.totalProjects,
        activeProjects: overview.activeProjects,
        projectGrowth: overview.projectGrowth,
        totalRevenue: overview.totalRevenue,
        monthlyRevenue: overview.monthlyRevenue,
        revenueGrowth: overview.revenueGrowth,
        totalClients: overview.totalClients,
        newClients: overview.newClients,
        clientGrowth: overview.clientGrowth,
        efficiency: overview.efficiency,
        billableHours: overview.billableHours,
        efficiencyGrowth: overview.efficiencyGrowth,
        metrics: metricsResult.data || [],
        message: 'Analytics summary retrieved successfully'
      };
    } catch (error) {
      logger.error('AI tool: Unexpected error fetching analytics', { error });
      yield {
        success: false,
        error: 'An unexpected error occurred while fetching analytics',
      };
    }
  },
});

// Export all tools as an array for easy import
const freeflowzeeTools = [
  createProjectTool,
  uploadFileTool,
  generateAIAssetTool,
  createEscrowDepositTool,
  analyticsSummaryTool,
];

export default freeflowzeeTools; 