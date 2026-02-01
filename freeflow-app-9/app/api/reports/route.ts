// =====================================================
// KAZI Reporting & Exports API - Main Route
// Reports, analytics & data exports
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reportsService } from '@/lib/reports/reports-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('reports');

// =====================================================
// GET - List reports or get dashboard metrics
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return mock data for unauthenticated users (demo mode)
      return NextResponse.json({
        success: true,
        reports: [],
        message: 'Please log in to view your reports',
      });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'dashboard-metrics': {
        const metrics = await reportsService.getDashboardMetrics(user.id);
        return NextResponse.json({ success: true, metrics });
      }

      case 'exports': {
        const exports = await reportsService.getExports(user.id);
        return NextResponse.json({ success: true, exports });
      }

      case 'templates': {
        const reports = await reportsService.getReports(user.id);
        const templates = reports.filter(r => r.is_template);
        return NextResponse.json({ success: true, templates });
      }

      default: {
        const type = searchParams.get('type') as string | null;
        const reports = await reportsService.getReports(user.id, type);
        return NextResponse.json({
          success: true,
          action: 'list',
          reports,
          total: reports.length,
          message: `Found ${reports.length} reports`,
        });
      }
    }
  } catch (error) {
    logger.error('Reports GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create reports, generate, or export
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoMode(action, data);
    }

    switch (action) {
      case 'create': {
        if (!data.name) {
          return NextResponse.json({
            success: false,
            error: 'Report name is required',
          }, { status: 400 });
        }

        const report = await reportsService.createReport(user.id, {
          name: data.name,
          description: data.description,
          type: data.type || 'revenue',
          config: data.config || {
            date_range: { type: 'preset', preset: 'this_month' },
          },
          schedule: data.schedule,
          is_template: data.is_template,
          is_public: data.is_public,
        });
        return NextResponse.json({
          success: true,
          action: 'create',
          report,
          message: `Report "${report.name}" created successfully`,
        }, { status: 201 });
      }

      case 'generate': {
        if (!data.report_id && !data.reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report ID required',
          }, { status: 400 });
        }

        const reportId = data.report_id || data.reportId;
        const result = await reportsService.generateReport(user.id, reportId);
        return NextResponse.json({
          success: true,
          action: 'generate',
          result,
          message: 'Report generated successfully',
        });
      }

      case 'quick-generate': {
        // Generate a one-time report without saving
        const tempReport = await reportsService.createReport(user.id, {
          name: `Quick Report - ${new Date().toISOString()}`,
          type: data.type || 'revenue',
          config: data.config || {
            date_range: { type: 'preset', preset: 'this_month' },
          },
        });

        const result = await reportsService.generateReport(user.id, tempReport.id);

        // Delete the temporary report
        await reportsService.deleteReport(tempReport.id, user.id);

        return NextResponse.json({
          success: true,
          action: 'quick-generate',
          result,
          message: 'Report generated successfully',
        });
      }

      case 'export': {
        if (!data.report_id && !data.reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report ID and export format required',
          }, { status: 400 });
        }

        const exportRecord = await reportsService.createExport(user.id, {
          report_id: data.report_id || data.reportId,
          type: data.type || 'report',
          format: data.format || data.exportFormat || 'pdf',
          data: data.data,
        });
        return NextResponse.json({
          success: true,
          action: 'export',
          export: exportRecord,
          message: `Report export started`,
        }, { status: 201 });
      }

      case 'export-data': {
        // Direct data export without a saved report
        const exportRecord = await reportsService.createExport(user.id, {
          type: data.type || 'data',
          format: data.format || 'csv',
          data: data.data,
        });
        return NextResponse.json({
          success: true,
          action: 'export-data',
          export: exportRecord,
          message: 'Data export started',
        }, { status: 201 });
      }

      case 'delete': {
        if (!data.report_id && !data.reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report ID required',
          }, { status: 400 });
        }

        const reportId = data.report_id || data.reportId;
        await reportsService.deleteReport(reportId, user.id);
        return NextResponse.json({
          success: true,
          action: 'delete',
          reportId,
          message: 'Report deleted successfully',
        });
      }

      case 'schedule': {
        if (!data.report_id && !data.reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report ID required',
          }, { status: 400 });
        }

        const reportId = data.report_id || data.reportId;
        const report = await reportsService.updateReport(reportId, user.id, {
          schedule: data.schedule,
        });
        return NextResponse.json({
          success: true,
          action: 'schedule',
          report,
          message: 'Report schedule updated',
        });
      }

      case 'update': {
        if (!data.report_id && !data.reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report ID required',
          }, { status: 400 });
        }

        const reportId = data.report_id || data.reportId;
        const report = await reportsService.updateReport(reportId, user.id, {
          name: data.name,
          description: data.description,
          config: data.config,
          schedule: data.schedule,
          is_template: data.is_template,
          is_public: data.is_public,
        });
        return NextResponse.json({
          success: true,
          action: 'update',
          report,
          message: 'Report updated successfully',
        });
      }

      case 'share': {
        const reportId = data.report_id || data.reportId || data.dashboard_id;
        if (!reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report or dashboard ID required',
          }, { status: 400 });
        }

        // Record the share action
        const shareRecord = {
          id: `share-${Date.now()}`,
          resource_id: reportId,
          resource_type: data.dashboard_id ? 'dashboard' : 'report',
          share_url: data.share_url,
          recipients: data.recipients || [],
          permission: data.permission || 'view',
          message: data.message,
          expires_at: data.expires_in_days
            ? new Date(Date.now() + data.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
            : null,
          shared_by: user.id,
          shared_at: new Date().toISOString(),
        };

        // Optionally update the report to be public if sharing externally
        if (data.permission !== 'private') {
          try {
            await reportsService.updateReport(reportId, user.id, {
              is_public: true,
            });
          } catch {
            // Ignore error if it's a dashboard
          }
        }

        return NextResponse.json({
          success: true,
          action: 'share',
          share: shareRecord,
          message: 'Shared successfully',
        });
      }

      case 'save-as-template': {
        if (!data.report_id && !data.reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report ID required',
          }, { status: 400 });
        }

        const sourceReportId = data.report_id || data.reportId;
        const sourceReport = await reportsService.getReportById(sourceReportId, user.id);

        if (!sourceReport) {
          return NextResponse.json({
            success: false,
            error: 'Source report not found',
          }, { status: 404 });
        }

        const template = await reportsService.createReport(user.id, {
          name: data.templateName || `${sourceReport.name} Template`,
          description: sourceReport.description,
          type: sourceReport.type,
          config: sourceReport.config,
          is_template: true,
          is_public: false,
        });

        return NextResponse.json({
          success: true,
          action: 'save-as-template',
          template,
          message: 'Template created successfully',
        }, { status: 201 });
      }

      case 'create-from-template': {
        if (!data.template_id && !data.templateId) {
          return NextResponse.json({
            success: false,
            error: 'Template ID required',
          }, { status: 400 });
        }

        const templateId = data.template_id || data.templateId;
        const template = await reportsService.getReportById(templateId, user.id);

        if (!template) {
          return NextResponse.json({
            success: false,
            error: 'Template not found',
          }, { status: 404 });
        }

        const report = await reportsService.createReport(user.id, {
          name: data.name || `${template.name} (from template)`,
          description: template.description,
          type: template.type,
          config: { ...template.config, ...data.config },
          is_template: false,
          is_public: false,
        });

        return NextResponse.json({
          success: true,
          action: 'create-from-template',
          report,
          message: 'Report created from template',
        }, { status: 201 });
      }

      case 'save-filter-preset': {
        if (!data.report_id && !data.reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report ID required',
          }, { status: 400 });
        }

        if (!data.presetName) {
          return NextResponse.json({
            success: false,
            error: 'Preset name required',
          }, { status: 400 });
        }

        const presetReportId = data.report_id || data.reportId;
        const existingReport = await reportsService.getReportById(presetReportId, user.id);

        if (!existingReport) {
          return NextResponse.json({
            success: false,
            error: 'Report not found',
          }, { status: 404 });
        }

        // Store filter preset in the report's config
        const currentConfig = existingReport.config || {};
        const filterPresets = currentConfig.filter_presets || {};
        filterPresets[data.presetName] = {
          name: data.presetName,
          filters: data.filters,
          created_at: new Date().toISOString(),
        };

        const updatedReport = await reportsService.updateReport(presetReportId, user.id, {
          config: {
            ...currentConfig,
            filter_presets: filterPresets,
          },
        });

        return NextResponse.json({
          success: true,
          action: 'save-filter-preset',
          preset: filterPresets[data.presetName],
          report: updatedReport,
          message: 'Filter preset saved',
        });
      }

      case 'list': {
        const type = data.type as any;
        const reports = await reportsService.getReports(user.id, type);
        return NextResponse.json({
          success: true,
          action: 'list',
          reports,
          total: reports.length,
          message: `Found ${reports.length} reports`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Reports POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// Demo mode handler for unauthenticated users
function handleDemoMode(action: string, data: any) {
  switch (action) {
    case 'create':
      return NextResponse.json({
        success: true,
        action: 'create',
        report: {
          id: `RPT-DEMO-${Date.now()}`,
          name: data.name || 'Demo Report',
          type: data.type || 'analytics',
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
        message: 'Report created (demo mode)',
      });

    case 'generate':
      return NextResponse.json({
        success: true,
        action: 'generate',
        result: {
          report_id: data.reportId || 'DEMO',
          generated_at: new Date().toISOString(),
          summary: {
            total_revenue: 45000,
            total_clients: 12,
            total_projects: 8,
          },
          data: [],
        },
        message: 'Report generated (demo mode)',
      });

    case 'export':
      return NextResponse.json({
        success: true,
        action: 'export',
        format: data.exportFormat || 'PDF',
        message: 'Report export simulated (demo mode)',
        downloadUrl: '/demo/report.pdf',
      });

    case 'delete':
      return NextResponse.json({
        success: true,
        action: 'delete',
        message: 'Report deleted (demo mode)',
      });

    case 'schedule':
      return NextResponse.json({
        success: true,
        action: 'schedule',
        message: 'Report scheduled (demo mode)',
      });

    case 'list':
      return NextResponse.json({
        success: true,
        action: 'list',
        reports: [
          {
            id: 'RPT-DEMO-001',
            name: 'Monthly Analytics Report',
            type: 'analytics',
            status: 'ready',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        total: 1,
        message: 'Demo reports loaded',
      });

    default:
      return NextResponse.json({
        success: false,
        error: 'Please log in to use this feature',
      }, { status: 401 });
  }
}
