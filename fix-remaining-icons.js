#!/usr/bin/env node
/**
 * fix-remaining-icons.js
 * 
 * A script to systematically fix all remaining missing icons in the KAZI platform.
 * This script targets specific components that have missing icons according to test results
 * and adds the proper Lucide React icon components wrapped in gradient containers.
 * 
 * Usage: node fix-remaining-icons.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Base directory for components
const COMPONENTS_DIR = path.join(process.cwd(), 'freeflow-app-9', 'components');
const DASHBOARD_DIR = path.join(process.cwd(), 'freeflow-app-9', 'app', 'dashboard');

// Define the missing icons and their corresponding components
const MISSING_ICONS = [
  {
    icon: 'FolderOpen',
    component: 'projects-hub',
    description: 'Projects Hub icon'
  },
  {
    icon: 'TrendingUp',
    component: 'analytics',
    description: 'Analytics icon'
  },
  {
    icon: 'Zap',
    component: 'ai-assistant',
    description: 'AI Assistant icon'
  },
  {
    icon: 'Monitor',
    component: 'canvas',
    description: 'Canvas icon'
  },
  {
    icon: 'DollarSign',
    component: 'financial-hub',
    description: 'Financial Hub icon'
  },
  {
    icon: 'Wallet',
    component: 'financial',
    description: 'Financial icon'
  },
  {
    icon: 'Receipt',
    component: 'invoices',
    description: 'Invoices icon'
  },
  {
    icon: 'MessageSquare',
    component: 'messages',
    description: 'Messages icon'
  }
];

/**
 * Find component files that need icon fixes
 * @returns {Promise<Array<{icon: string, component: string, filePath: string}>>}
 */
async function findComponentFiles() {
  const componentFiles = [];
  
  for (const iconInfo of MISSING_ICONS) {
    // Check multiple possible file locations
    const possiblePaths = [
      // Main component file
      path.join(COMPONENTS_DIR, `${iconInfo.component}.tsx`),
      // Dashboard page file
      path.join(DASHBOARD_DIR, iconInfo.component, 'page.tsx'),
      // Component in dashboard folder
      path.join(DASHBOARD_DIR, `${iconInfo.component}.tsx`),
      // Component in subdirectory
      path.join(COMPONENTS_DIR, iconInfo.component, 'index.tsx'),
      // Dashboard component
      path.join(COMPONENTS_DIR, 'dashboard', `${iconInfo.component}.tsx`),
      // Dashboard page component
      path.join(COMPONENTS_DIR, 'dashboard', iconInfo.component, 'page.tsx')
    ];
    
    for (const filePath of possiblePaths) {
      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        componentFiles.push({
          ...iconInfo,
          filePath
        });
        console.log(`Found component file for ${iconInfo.component}: ${filePath}`);
        break;
      } catch (err) {
        // File doesn't exist, try next path
        continue;
      }
    }
  }
  
  return componentFiles;
}

/**
 * Add Lucide icon import to a file if it doesn't already exist
 * @param {string} content - File content
 * @param {string} iconName - Icon name to import
 * @returns {string} - Updated file content
 */
function addIconImport(content, iconName) {
  // Check if the icon is already imported
  if (content.includes(`import { ${iconName} }`)) {
    return content;
  }
  
  // Check if there's already a Lucide import we can extend
  const lucideImportRegex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["'];?/;
  const match = content.match(lucideImportRegex);
  
  if (match) {
    // Extend existing import
    const currentImports = match[1];
    if (!currentImports.includes(iconName)) {
      const newImport = currentImports.includes(',') 
        ? `import { ${currentImports}, ${iconName} } from "lucide-react";`
        : `import { ${currentImports}, ${iconName} } from "lucide-react";`;
      return content.replace(lucideImportRegex, newImport);
    }
    return content;
  } else {
    // Add new import statement after the last import or at the top if no imports
    const importStatements = content.match(/import\s+.+?from\s+["'].+?["'];?/gs) || [];
    
    if (importStatements.length > 0) {
      const lastImport = importStatements[importStatements.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
      return content.slice(0, lastImportIndex) + 
             `\nimport { ${iconName} } from "lucide-react";` + 
             content.slice(lastImportIndex);
    } else {
      return `import { ${iconName} } from "lucide-react";\n\n${content}`;
    }
  }
}

/**
 * Add gradient container component import if needed
 * @param {string} content - File content
 * @returns {string} - Updated file content
 */
function addGradientContainerImport(content) {
  if (content.includes('import { GradientContainer }') || 
      content.includes('import GradientContainer')) {
    return content;
  }
  
  const importStatements = content.match(/import\s+.+?from\s+["'].+?["'];?/gs) || [];
  
  if (importStatements.length > 0) {
    const lastImport = importStatements[importStatements.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
    return content.slice(0, lastImportIndex) + 
           '\nimport { GradientContainer } from "@/components/ui/gradient-container";' + 
           content.slice(lastImportIndex);
  } else {
    return `import { GradientContainer } from "@/components/ui/gradient-container";\n\n${content}`;
  }
}

/**
 * Create GradientContainer component if it doesn't exist
 */
async function ensureGradientContainerExists() {
  const gradientContainerPath = path.join(COMPONENTS_DIR, 'ui', 'gradient-container.tsx');
  
  try {
    await fs.promises.access(gradientContainerPath, fs.constants.F_OK);
    console.log('GradientContainer component already exists.');
  } catch (err) {
    // Create the component if it doesn't exist
    const gradientContainerContent = `"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
}

export function GradientContainer({
  children,
  size = "md",
  variant = "primary",
  className,
  ...props
}: GradientContainerProps) {
  // Size mappings
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }
  
  // Gradient mappings
  const gradientMap = {
    primary: "bg-gradient-to-br from-blue-500 to-indigo-600",
    secondary: "bg-gradient-to-br from-purple-500 to-pink-600",
    success: "bg-gradient-to-br from-green-500 to-emerald-600",
    warning: "bg-gradient-to-br from-yellow-500 to-amber-600",
    danger: "bg-gradient-to-br from-red-500 to-rose-600"
  }
  
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md",
        sizeMap[size],
        gradientMap[variant],
        className
      )}
      {...props}
    >
      <div className="text-white">
        {children}
      </div>
    </div>
  )
}
`;
    
    // Create directory if it doesn't exist
    await fs.promises.mkdir(path.dirname(gradientContainerPath), { recursive: true });
    await writeFile(gradientContainerPath, gradientContainerContent);
    console.log('Created GradientContainer component at', gradientContainerPath);
  }
}

/**
 * Add icon component to the file
 * @param {string} content - File content
 * @param {string} iconName - Icon name to add
 * @returns {string} - Updated file content with icon component
 */
function addIconComponent(content, iconName) {
  // Look for common icon placement patterns
  const iconPlaceholders = [
    `{/* ${iconName} icon placeholder */}`,
    `{/* Icon: ${iconName} */}`,
    `{/* TODO: Add ${iconName} */}`,
    `<div className="icon-placeholder"`,
    `<span className="icon"`,
    `<div className="icon"`,
    `<div className="w-5 h-5"`,
    `<div className="w-6 h-6"`
  ];
  
  let updatedContent = content;
  
  // Try to find and replace icon placeholders
  for (const placeholder of iconPlaceholders) {
    if (updatedContent.includes(placeholder)) {
      const iconComponent = `<GradientContainer size="md" variant="primary">
        <${iconName} className="h-4 w-4" />
      </GradientContainer>`;
      
      updatedContent = updatedContent.replace(
        new RegExp(`${placeholder}[^<]*<\/div>`, 'g'), 
        iconComponent
      );
      
      // If we found a placeholder to replace, we're done
      if (updatedContent !== content) {
        return updatedContent;
      }
    }
  }
  
  // If we couldn't find a specific placeholder, look for common component patterns
  const componentPatterns = [
    // Card header pattern
    /<div[^>]*className="?[^"]*card-header[^>]*>[\s\n]*<h[0-9][^>]*>(.*?)<\/h[0-9]>/gs,
    // Section header pattern
    /<div[^>]*className="?[^"]*section-header[^>]*>[\s\n]*<h[0-9][^>]*>(.*?)<\/h[0-9]>/gs,
    // Title with flex pattern
    /<div[^>]*className="?[^"]*flex[^"]*items-center[^>]*>[\s\n]*<h[0-9][^>]*>/g,
    // Dashboard item pattern
    /<div[^>]*className="?[^"]*dashboard-item[^>]*>/g
  ];
  
  for (const pattern of componentPatterns) {
    const matches = [...updatedContent.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      const iconComponent = `<div className="mr-2">
        <GradientContainer size="md" variant="primary">
          <${iconName} className="h-4 w-4" />
        </GradientContainer>
      </div>`;
      
      // Insert the icon before the title
      const insertPosition = match.index + match[0].length;
      updatedContent = 
        updatedContent.slice(0, insertPosition) + 
        iconComponent + 
        updatedContent.slice(insertPosition);
      
      return updatedContent;
    }
  }
  
  // Last resort: Try to find the component's main container and add the icon there
  const mainContainerPattern = /<div[^>]*className="?[^"]*container[^>]*>/g;
  const mainContainerMatch = mainContainerPattern.exec(updatedContent);
  
  if (mainContainerMatch) {
    const iconComponent = `<div className="flex items-center justify-center mb-4">
      <GradientContainer size="lg" variant="primary">
        <${iconName} className="h-6 w-6" />
      </GradientContainer>
    </div>`;
    
    const insertPosition = mainContainerMatch.index + mainContainerMatch[0].length;
    updatedContent = 
      updatedContent.slice(0, insertPosition) + 
      iconComponent + 
      updatedContent.slice(insertPosition);
    
    return updatedContent;
  }
  
  // If we couldn't find a good place to insert the icon, log a warning
  console.warn(`Could not find a suitable place to insert ${iconName} icon. Manual intervention may be required.`);
  return content;
}

/**
 * Fix a single component file
 * @param {Object} componentInfo - Component information
 * @returns {Promise<boolean>} - Whether the fix was successful
 */
async function fixComponentFile(componentInfo) {
  try {
    const { icon, component, filePath } = componentInfo;
    
    console.log(`\n[${component}] Fixing missing ${icon} icon...`);
    
    // Read the file
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    
    // Add icon import
    content = addIconImport(content, icon);
    
    // Add GradientContainer import
    content = addGradientContainerImport(content);
    
    // Add icon component
    content = addIconComponent(content, icon);
    
    // Write the file if changes were made
    if (content !== originalContent) {
      await writeFile(filePath, content);
      console.log(`[${component}] Successfully added ${icon} icon to ${filePath}`);
      return true;
    } else {
      console.log(`[${component}] No changes needed for ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`Error fixing component:`, err);
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  console.log('🔍 Starting icon fix script...');
  console.log('🎯 Target icons:', MISSING_ICONS.map(i => `${i.icon} (${i.component})`).join(', '));
  
  // Ensure GradientContainer component exists
  await ensureGradientContainerExists();
  
  // Find component files
  const componentFiles = await findComponentFiles();
  
  if (componentFiles.length === 0) {
    console.log('❌ No component files found. Please check the file paths.');
    process.exit(1);
  }
  
  console.log(`\n📂 Found ${componentFiles.length} component files to fix.`);
  
  // Fix each component file
  let fixedCount = 0;
  for (const componentInfo of componentFiles) {
    const fixed = await fixComponentFile(componentInfo);
    if (fixed) fixedCount++;
  }
  
  console.log(`\n✅ Fixed ${fixedCount}/${componentFiles.length} components.`);
  
  // If some components couldn't be fixed, list them
  const unfixedComponents = componentFiles.filter((_, i) => i >= fixedCount);
  if (unfixedComponents.length > 0) {
    console.log('\n⚠️ The following components may need manual intervention:');
    unfixedComponents.forEach(c => {
      console.log(`   - ${c.component} (${c.icon}) at ${c.filePath}`);
    });
  }
  
  console.log('\n🎉 Icon fix script completed!');
}

// Run the script
main().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
