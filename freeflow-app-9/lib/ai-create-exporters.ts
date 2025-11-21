/**
 * AI CREATE A++++ EXPORT UTILITIES
 * Multi-format content export (TXT, MD, HTML, JSON, PDF, DOCX)
 */

export interface ExportOptions {
  format: 'txt' | 'md' | 'html' | 'json' | 'pdf' | 'docx'
  title: string
  content: string
  metadata?: {
    model?: string
    tokens?: number
    cost?: number
    temperature?: number
    timestamp?: Date
  }
}

/**
 * Export as Plain Text (.txt)
 */
export function exportAsTXT(options: ExportOptions): void {
  const { title, content, metadata } = options

  let output = ''

  if (metadata) {
    output += `Title: ${title}\n`
    output += `Generated: ${metadata.timestamp?.toLocaleString() || new Date().toLocaleString()}\n`
    if (metadata.model) output += `Model: ${metadata.model}\n`
    if (metadata.tokens) output += `Tokens: ${metadata.tokens}\n`
    if (metadata.cost) output += `Cost: $${metadata.cost.toFixed(4)}\n`
    output += `\n${'='.repeat(60)}\n\n`
  }

  output += content

  downloadFile(output, `${sanitizeFilename(title)}.txt`, 'text/plain')
}

/**
 * Export as Markdown (.md)
 */
export function exportAsMarkdown(options: ExportOptions): void {
  const { title, content, metadata } = options

  let output = `# ${title}\n\n`

  if (metadata) {
    output += `---\n`
    output += `**Generated:** ${metadata.timestamp?.toLocaleString() || new Date().toLocaleString()}\n\n`
    if (metadata.model) output += `**Model:** ${metadata.model}\n\n`
    if (metadata.tokens) output += `**Tokens:** ${metadata.tokens}\n\n`
    if (metadata.cost) output += `**Cost:** $${metadata.cost.toFixed(4)}\n\n`
    output += `---\n\n`
  }

  output += content

  downloadFile(output, `${sanitizeFilename(title)}.md`, 'text/markdown')
}

/**
 * Export as HTML (.html)
 */
export function exportAsHTML(options: ExportOptions): void {
  const { title, content, metadata } = options

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }
        .metadata {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
        }
        .metadata strong {
            color: #1f2937;
        }
        .content {
            margin-top: 30px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>${escapeHtml(title)}</h1>

    ${metadata ? `
    <div class="metadata">
        <strong>Generated:</strong> ${metadata.timestamp?.toLocaleString() || new Date().toLocaleString()}<br>
        ${metadata.model ? `<strong>Model:</strong> ${metadata.model}<br>` : ''}
        ${metadata.tokens ? `<strong>Tokens:</strong> ${metadata.tokens.toLocaleString()}<br>` : ''}
        ${metadata.cost ? `<strong>Cost:</strong> $${metadata.cost.toFixed(4)}<br>` : ''}
        ${metadata.temperature ? `<strong>Temperature:</strong> ${metadata.temperature}` : ''}
    </div>
    ` : ''}

    <div class="content">${escapeHtml(content)}</div>

    <div class="footer">
        Generated with KAZI AI Create Studio
    </div>
</body>
</html>
  `.trim()

  downloadFile(html, `${sanitizeFilename(title)}.html`, 'text/html')
}

/**
 * Export as JSON (.json)
 */
export function exportAsJSON(options: ExportOptions): void {
  const { title, content, metadata } = options

  const json = {
    title,
    content,
    metadata: {
      ...metadata,
      timestamp: metadata?.timestamp?.toISOString() || new Date().toISOString()
    },
    exportedAt: new Date().toISOString(),
    source: 'KAZI AI Create Studio'
  }

  const jsonString = JSON.stringify(json, null, 2)
  downloadFile(jsonString, `${sanitizeFilename(title)}.json`, 'application/json')
}

/**
 * Export as PDF (.pdf)
 * Note: This is a simplified version. For production, use jsPDF or similar library
 */
export function exportAsPDF(options: ExportOptions): void {
  const { title, content, metadata } = options

  // For now, create an HTML and suggest print-to-PDF
  // In production, integrate jsPDF library
  const html = generatePDFHTML(title, content, metadata)

  // Create a temporary window for printing
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

/**
 * Export as Word Document (.docx)
 * Note: This is a simplified version. For production, use docx library
 */
export function exportAsDOCX(options: ExportOptions): void {
  const { title, content, metadata } = options

  // Create a simple RTF format (compatible with Word)
  let rtf = '{\\rtf1\\ansi\\deff0\n'
  rtf += '{\\fonttbl{\\f0 Times New Roman;}}\n'

  // Title
  rtf += `{\\b\\fs36 ${title}}\\par\\par\n`

  // Metadata
  if (metadata) {
    rtf += '{\\fs20\n'
    rtf += `Generated: ${metadata.timestamp?.toLocaleString() || new Date().toLocaleString()}\\par\n`
    if (metadata.model) rtf += `Model: ${metadata.model}\\par\n`
    if (metadata.tokens) rtf += `Tokens: ${metadata.tokens}\\par\n`
    if (metadata.cost) rtf += `Cost: \\$${metadata.cost.toFixed(4)}\\par\n`
    rtf += '}\\par\\par\n'
  }

  // Content
  rtf += `{\\fs24 ${escapeRTF(content)}}\\par\n`
  rtf += '}\n'

  downloadFile(rtf, `${sanitizeFilename(title)}.rtf`, 'application/rtf')
}

/**
 * Generate HTML for PDF printing
 */
function generatePDFHTML(title: string, content: string, metadata?: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(title)}</title>
    <style>
        @media print {
            @page { margin: 1in; }
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
        }
        h1 {
            font-size: 24pt;
            margin-bottom: 20pt;
        }
        .metadata {
            font-size: 10pt;
            color: #666;
            margin-bottom: 20pt;
            padding-bottom: 10pt;
            border-bottom: 1px solid #ccc;
        }
        .content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <h1>${escapeHtml(title)}</h1>
    ${metadata ? `
    <div class="metadata">
        Generated: ${metadata.timestamp?.toLocaleString() || new Date().toLocaleString()}<br>
        ${metadata.model ? `Model: ${metadata.model}<br>` : ''}
        ${metadata.tokens ? `Tokens: ${metadata.tokens}<br>` : ''}
        ${metadata.cost ? `Cost: $${metadata.cost.toFixed(4)}` : ''}
    </div>
    ` : ''}
    <div class="content">${escapeHtml(content)}</div>
</body>
</html>
  `.trim()
}

/**
 * Download file to user's computer
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log(`✅ Downloaded: ${filename}`)
  } catch (error) {
    console.error('❌ Failed to download file:', error)
    throw error
  }
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100) || 'ai-content'
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Escape RTF special characters
 */
function escapeRTF(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\n/g, '\\par\n')
}

/**
 * Get export format metadata
 */
export const EXPORT_FORMATS = [
  { id: 'txt', name: 'Plain Text', extension: '.txt', mimeType: 'text/plain', icon: 'FileText' },
  { id: 'md', name: 'Markdown', extension: '.md', mimeType: 'text/markdown', icon: 'FileCode' },
  { id: 'html', name: 'HTML', extension: '.html', mimeType: 'text/html', icon: 'Globe' },
  { id: 'json', name: 'JSON', extension: '.json', mimeType: 'application/json', icon: 'FileJson' },
  { id: 'pdf', name: 'PDF', extension: '.pdf', mimeType: 'application/pdf', icon: 'FileImage' },
  { id: 'docx', name: 'Word', extension: '.rtf', mimeType: 'application/rtf', icon: 'FileType' }
]

/**
 * Main export function - routes to appropriate exporter
 */
export function exportContent(options: ExportOptions): void {
  switch (options.format) {
    case 'txt':
      exportAsTXT(options)
      break
    case 'md':
      exportAsMarkdown(options)
      break
    case 'html':
      exportAsHTML(options)
      break
    case 'json':
      exportAsJSON(options)
      break
    case 'pdf':
      exportAsPDF(options)
      break
    case 'docx':
      exportAsDOCX(options)
      break
    default:
      exportAsTXT(options)
  }
}
