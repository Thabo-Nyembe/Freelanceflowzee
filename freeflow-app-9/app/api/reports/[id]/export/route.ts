// =====================================================
// Report Export API - PDF, CSV, XLSX Export
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// =====================================================
// GET - Export report in specified format
// =====================================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Try to fetch from reporting_dashboards first (used by reports-v2)
    let report = null
    const { data: dashboard } = await supabase
      .from('reporting_dashboards')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (dashboard) {
      report = {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
        type: 'dashboard',
        status: dashboard.is_published ? 'published' : 'draft',
        created_at: dashboard.created_at,
        updated_at: dashboard.updated_at,
        widgets: dashboard.widgets,
        views: dashboard.views,
        favorites: dashboard.favorites,
        tags: dashboard.tags,
      }
    } else {
      // Fallback to reports table
      const { data: reportData } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (reportData) {
        report = reportData
      }
    }

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    // Generate export based on format
    switch (format.toLowerCase()) {
      case 'csv':
        return generateCSVExport(report)
      case 'xlsx':
        return generateXLSXExport(report)
      case 'pdf':
        return generatePDFExport(report)
      case 'json':
        return generateJSONExport(report)
      default:
        return NextResponse.json(
          { success: false, error: `Unsupported format: ${format}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Export failed' },
      { status: 500 }
    )
  }
}

// =====================================================
// CSV Export Generator
// =====================================================
function generateCSVExport(report: any): NextResponse {
  const rows: string[] = []

  // Header row
  rows.push('Field,Value')

  // Report metadata
  rows.push(`"Name","${escapeCSV(report.name)}"`)
  rows.push(`"Description","${escapeCSV(report.description || '')}"`)
  rows.push(`"Type","${escapeCSV(report.type || 'dashboard')}"`)
  rows.push(`"Status","${escapeCSV(report.status || 'draft')}"`)
  rows.push(`"Created","${report.created_at}"`)
  rows.push(`"Updated","${report.updated_at}"`)
  rows.push(`"Views","${report.views || 0}"`)
  rows.push(`"Favorites","${report.favorites || 0}"`)

  // Tags
  if (report.tags && report.tags.length > 0) {
    rows.push(`"Tags","${escapeCSV(report.tags.join(', '))}"`)
  }

  // Widgets data if available
  if (report.widgets && Array.isArray(report.widgets) && report.widgets.length > 0) {
    rows.push('')
    rows.push('Widget ID,Widget Type,Widget Title')
    report.widgets.forEach((widget: any) => {
      rows.push(`"${escapeCSV(widget.id || '')}","${escapeCSV(widget.type || '')}","${escapeCSV(widget.title || '')}"`)
    })
  }

  const csvContent = rows.join('\n')
  const filename = `${sanitizeFilename(report.name)}-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// =====================================================
// XLSX Export Generator (Simple CSV-based for now)
// =====================================================
function generateXLSXExport(report: any): NextResponse {
  // For a proper XLSX, you'd use a library like xlsx or exceljs
  // For now, we return a CSV that Excel can open
  const rows: string[] = []

  rows.push('Report Export')
  rows.push('')
  rows.push('Field\tValue')
  rows.push(`Name\t${report.name}`)
  rows.push(`Description\t${report.description || ''}`)
  rows.push(`Type\t${report.type || 'dashboard'}`)
  rows.push(`Status\t${report.status || 'draft'}`)
  rows.push(`Created\t${report.created_at}`)
  rows.push(`Updated\t${report.updated_at}`)
  rows.push(`Views\t${report.views || 0}`)
  rows.push(`Favorites\t${report.favorites || 0}`)

  if (report.tags && report.tags.length > 0) {
    rows.push(`Tags\t${report.tags.join(', ')}`)
  }

  if (report.widgets && Array.isArray(report.widgets) && report.widgets.length > 0) {
    rows.push('')
    rows.push('Widgets')
    rows.push('ID\tType\tTitle')
    report.widgets.forEach((widget: any) => {
      rows.push(`${widget.id || ''}\t${widget.type || ''}\t${widget.title || ''}`)
    })
  }

  const content = rows.join('\n')
  const filename = `${sanitizeFilename(report.name)}-${new Date().toISOString().split('T')[0]}.xlsx`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// =====================================================
// PDF Export Generator (HTML-based for browser printing)
// =====================================================
function generatePDFExport(report: any): NextResponse {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHTML(report.name)} - Report Export</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #1a1a1a;
    }
    h1 {
      color: #7c3aed;
      border-bottom: 2px solid #7c3aed;
      padding-bottom: 10px;
    }
    .meta {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .meta-item {
      display: flex;
      margin-bottom: 10px;
    }
    .meta-label {
      font-weight: 600;
      width: 120px;
      color: #6b7280;
    }
    .meta-value {
      flex: 1;
    }
    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tag {
      background: #e0e7ff;
      color: #4338ca;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
    }
    .widgets {
      margin-top: 30px;
    }
    .widgets h2 {
      color: #374151;
    }
    .widget-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${escapeHTML(report.name)}</h1>

  <div class="meta">
    <div class="meta-item">
      <span class="meta-label">Description</span>
      <span class="meta-value">${escapeHTML(report.description || 'No description')}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Type</span>
      <span class="meta-value">${escapeHTML(report.type || 'Dashboard')}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Status</span>
      <span class="meta-value">${escapeHTML(report.status || 'Draft')}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Created</span>
      <span class="meta-value">${new Date(report.created_at).toLocaleDateString()}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Last Updated</span>
      <span class="meta-value">${new Date(report.updated_at).toLocaleDateString()}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Views</span>
      <span class="meta-value">${report.views || 0}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Favorites</span>
      <span class="meta-value">${report.favorites || 0}</span>
    </div>
    ${report.tags && report.tags.length > 0 ? `
    <div class="meta-item">
      <span class="meta-label">Tags</span>
      <div class="tags">
        ${report.tags.map((tag: string) => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
      </div>
    </div>
    ` : ''}
  </div>

  ${report.widgets && report.widgets.length > 0 ? `
  <div class="widgets">
    <h2>Widgets (${report.widgets.length})</h2>
    ${report.widgets.map((widget: any) => `
      <div class="widget-card">
        <strong>${escapeHTML(widget.title || widget.type || 'Widget')}</strong>
        <p style="color: #6b7280; margin: 5px 0 0 0;">${escapeHTML(widget.type || 'Unknown type')}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()} | KAZI Reports</p>
  </div>

  <script class="no-print">
    window.print();
  </script>
</body>
</html>
`

  const filename = `${sanitizeFilename(report.name)}-${new Date().toISOString().split('T')[0]}.html`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// =====================================================
// JSON Export Generator
// =====================================================
function generateJSONExport(report: any): NextResponse {
  const exportData = {
    exported_at: new Date().toISOString(),
    report: {
      id: report.id,
      name: report.name,
      description: report.description,
      type: report.type,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
      views: report.views,
      favorites: report.favorites,
      tags: report.tags,
      widgets: report.widgets,
    },
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  const filename = `${sanitizeFilename(report.name)}-${new Date().toISOString().split('T')[0]}.json`

  return new NextResponse(jsonContent, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// =====================================================
// Helper Functions
// =====================================================
function escapeCSV(str: string): string {
  if (!str) return ''
  return str.replace(/"/g, '""')
}

function escapeHTML(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50)
}
