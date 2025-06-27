#!/usr/bin/env node

/**
 * 🔧 FIX ALL DOWNLOAD BUTTONS SCRIPT
 * 
 * This script systematically fixes all download buttons across the
 * FreeflowZee application to use the enhanced download utilities.
 * Uses Context7 patterns for consistent implementation.
 */

const fs = require('fs').promises;
const path = require('path');

// Components that need download button fixes
const COMPONENT_FIXES = [
  {
    file: 'app/(app)/dashboard/gallery/page.tsx',
    fixes: [
      {
        pattern: /onClick={() => handleDownload\(item\.id\)}/g,
        replacement: `onClick={() => handleUniversalDownload(item, { 
          type: 'gallery', 
          onSuccess: () => console.log('Gallery item downloaded'),
          onError: (error) => alert(\`Download failed: \${error.message}\`)
        })}`
      },
      {
        pattern: /onClick={handleBulkDownload}/g,
        replacement: `onClick={() => downloadAsZip(selectedItems.map(id => ({ id, name: \`item-\${id}\` })), 'gallery-items.zip')}`
      }
    ],
    imports: `import { handleUniversalDownload, downloadAsZip } from '@/lib/utils/download-utils'`
  },
  {
    file: 'app/(app)/dashboard/invoices/page.tsx',
    fixes: [
      {
        pattern: /onClick={() => {\s*console\.log\('Download invoice'\);\s*alert\('Invoice downloaded!'\);\s*}}/g,
        replacement: `onClick={() => handleUniversalDownload(invoice, {
          type: 'invoice',
          onSuccess: () => alert('Invoice downloaded!'),
          onError: (error) => alert(\`Download failed: \${error.message}\`)
        })}`
      }
    ],
    imports: `import { handleUniversalDownload } from '@/lib/utils/download-utils'`
  },
  {
    file: 'app/(app)/dashboard/analytics/page.tsx',
    fixes: [
      {
        pattern: /onClick={() => {\s*console\.log\('Export report'\);\s*alert\('Report exported!'\);\s*}}/g,
        replacement: `onClick={() => downloadReport('pdf', '/api/analytics/report', 'analytics-report.pdf')
          .then(() => alert('Report exported!'))
          .catch(error => alert(\`Export failed: \${error.message}\`))`
      }
    ],
    imports: `import { downloadReport } from '@/lib/utils/download-utils'`
  },
  {
    file: 'app/(app)/dashboard/escrow/page.tsx',
    fixes: [
      {
        pattern: /onClick={() => {\s*console\.log\('Download receipt clicked'\);\s*alert\('Receipt downloaded!'\);\s*}}/g,
        replacement: `onClick={() => downloadDocument('receipt', deposit, \`receipt-\${deposit.id}.pdf\`)
          .then(() => alert('Receipt downloaded!'))
          .catch(error => alert(\`Download failed: \${error.message}\`))`
      }
    ],
    imports: `import { downloadDocument } from '@/lib/utils/download-utils'`
  },
  {
    file: 'components/gallery/advanced-sharing-system.tsx',
    fixes: [
      {
        pattern: /const handleDownload = async \(item: GalleryItem, license: 'digital' \| 'print' \| 'commercial'\) => {[^}]+}/g,
        replacement: `const handleDownload = async (item: GalleryItem, license: 'digital' | 'print' | 'commercial') => {
    try {
      await downloadGalleryItem(item.id, license, galleryId);
    } catch (error) {
      alert(\`Download failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }`
      }
    ],
    imports: `import { downloadGalleryItem } from '@/lib/utils/download-utils'`
  },
  {
    file: 'components/gallery/advanced-gallery-system.tsx',
    fixes: [
      {
        pattern: /const handleDownloadItem = \(item: GalleryItem\) => {[^}]+}/g,
        replacement: `const handleDownloadItem = async (item: GalleryItem) => {
    try {
      await downloadGalleryItem(item.id, 'digital');
      
      // Update analytics
      setCollections(prev => prev.map(collection =>
        collection.id === selectedCollection?.id
          ? {
              ...collection,
              items: collection.items.map(i =>
                i.id === item.id
                  ? { ...i, downloads: i.downloads + 1 }
                  : i
              ),
              analytics: {
                ...collection.analytics,
                downloadCount: collection.analytics.downloadCount + 1,
                recentActivity: [
                  {
                    type: 'download',
                    timestamp: new Date().toISOString(),
                    details: \`Downloaded \${item.name}\`
                  },
                  ...collection.analytics.recentActivity.slice(0, 4)
                ]
              }
            }
          : collection
      ));
    } catch (error) {
      alert(\`Download failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }`
      }
    ],
    imports: `import { downloadGalleryItem } from '@/lib/utils/download-utils'`
  },
  {
    file: 'components/collaboration/enhanced-collaboration-system.tsx',
    fixes: [
      {
        pattern: /const handleDownloadAccess = async \(\) => {[^}]+}/g,
        replacement: `const handleDownloadAccess = async () => {
    if (!passwordInput.trim()) return

    try {
      await downloadWithPassword(fileId, passwordInput);
      setDownloadAccessDialog(false);
      setPasswordInput('');'
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Invalid password');
    }
  }`
      }
    ],
    imports: `import { downloadWithPassword } from '@/lib/utils/download-utils'`
  }
];

// Utility functions to add to components that don't have them
const UTILITY_ADDITIONS = {
  'app/(app)/dashboard/projects-hub/page.tsx': `
  // Enhanced download handlers using Context7 patterns
  const handleDownloadFile = useCallback(async (file: unknown) => {
    try {
      await handleUniversalDownload(file, {
        onSuccess: () => console.log('File downloaded successfully'),
        onError: (error) => alert(\`Download failed: \${error.message}\`)
      });
    } catch (error) {
      console.error('Download error: ', error);
    }
  }, []);

  const handleBulkDownload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await downloadAsZip(selectedFiles, 'project-files.zip');
      alert(\`Downloaded \${selectedFiles.length} files as ZIP\`);
    } catch (error) {
      alert(\`Bulk download failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }, [selectedFiles]);
  `, 'app/(app)/dashboard/video-studio/page.tsx': `
  // Video export handler
  const handleVideoExport = useCallback(async (format: 'mp4' | 'mov' | 'avi' = 'mp4') => {
    try {
      const response = await fetch('/api/video/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: currentProject?.id, format })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const filename = \`video-export-\${Date.now()}.\${format}\`;
        triggerDownload(blob, filename);
        alert('Video exported successfully!');
      } else {
        throw new Error('Video export failed');
      }
    } catch (error) {
      alert(\`Export failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }, [currentProject]);
  `
};

async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.warn(`Could not read file: ${filePath}`);
    return null;
  }
}

async function writeFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Could not write file: ${filePath}`, error);
    return false;
  }
}

function addImportIfNeeded(content, importStatement) {
  // Check if import already exists
  if (content.includes(importStatement.trim())) {
    return content;
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') && !lines[i].includes('//')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
    return lines.join('\n');
  }

  // If no imports found, add at the top after 'use client' if present
  const useClientIndex = lines.findIndex(line => line.includes('"use client"') || line.includes("'use client'"));
  const insertIndex = useClientIndex !== -1 ? useClientIndex + 2 : 0;
  
  lines.splice(insertIndex, 0, importStatement);
  return lines.join('\n');
}

function applyFixes(content, fixes) {
  let updatedContent = content;
  
  fixes.forEach(fix => {
    if (fix.pattern instanceof RegExp) {
      updatedContent = updatedContent.replace(fix.pattern, fix.replacement);
    } else {
      updatedContent = updatedContent.replaceAll(fix.pattern, fix.replacement);
    }
  });
  
  return updatedContent;
}

async function fixDownloadButtons() {
  console.log('🔧 Starting comprehensive download button fixes...');
  
  let totalFiles = 0;
  let fixedFiles = 0;
  let errors = [];

  for (const componentFix of COMPONENT_FIXES) {
    const filePath = path.join(process.cwd(), componentFix.file);
    totalFiles++;
    
    console.log(`\n📁 Processing: ${componentFix.file}`);
    
    const content = await readFile(filePath);
    if (!content) {
      errors.push(`Could not read ${componentFix.file}`);
      continue;
    }

    let updatedContent = content;
    
    // Add imports
    if (componentFix.imports) {
      updatedContent = addImportIfNeeded(updatedContent, componentFix.imports);
    }
    
    // Apply fixes
    updatedContent = applyFixes(updatedContent, componentFix.fixes);
    
    // Check if content changed
    if (updatedContent !== content) {
      const success = await writeFile(filePath, updatedContent);
      if (success) {
        console.log(`  ✅ Applied ${componentFix.fixes.length} fixes`);
        fixedFiles++;
      } else {
        errors.push(`Could not write ${componentFix.file}`);
      }
    } else {
      console.log(`  ⚠️  No changes needed`);
    }
  }

  // Add utility functions to components that need them
  console.log('\n🛠️  Adding utility functions to components...');
  
  for (const [filePath, utilityCode] of Object.entries(UTILITY_ADDITIONS)) {
    const fullPath = path.join(process.cwd(), filePath);
    const content = await readFile(fullPath);
    
    if (content && !content.includes('handleDownloadFile')) {
      // Find the component function and add utilities before the return statement
      const componentMatch = content.match(/(export default function \w+\([^)]*\)\s*{)/);
      if (componentMatch) {
        const insertPoint = content.indexOf(componentMatch[0]) + componentMatch[0].length;
        const updatedContent = content.slice(0, insertPoint) + utilityCode + content.slice(insertPoint);
        
        // Add import
        const finalContent = addImportIfNeeded(updatedContent, 
          `import { handleUniversalDownload, downloadAsZip, triggerDownload } from '@/lib/utils/download-utils'`
        );
        
        await writeFile(fullPath, finalContent);
        console.log(`  ✅ Added utilities to ${filePath}`);
      }
    }
  }

  // Generate summary report
  console.log('\n' + '='.repeat(60));'
  console.log('🎯 DOWNLOAD BUTTON FIX SUMMARY');
  console.log('='.repeat(60));'
  console.log(`📊 Files processed: ${totalFiles}`);
  console.log(`✅ Files fixed: ${fixedFiles}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors encountered: ');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n🎉 Download button fixes completed!');
  console.log('All components now use the enhanced download utilities.');
  
  return { totalFiles, fixedFiles, errors };
}

// Run the fix process
if (require.main === module) {
  fixDownloadButtons()
    .then(result => {
      process.exit(result.errors.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { fixDownloadButtons, COMPONENT_FIXES, UTILITY_ADDITIONS }; 