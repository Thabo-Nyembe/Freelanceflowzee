#!/usr/bin/env node
/**
 * comprehensive-icon-fix.js
 * 
 * This script creates stub icon components for all missing icons identified in the test results.
 * Each component imports the correct Lucide icon and exports it with proper gradient styling.
 * 
 * Usage: node comprehensive-icon-fix.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

// Base directory
const BASE_DIR = path.join(process.cwd(), 'freeflow-app-9');
const COMPONENTS_DIR = path.join(BASE_DIR, 'components');
const ICONS_DIR = path.join(COMPONENTS_DIR, 'icons');

// Define the missing icons and their target components
const MISSING_ICONS = [
  {
    icon: 'FolderOpen',
    component: 'projects-hub-icon',
    description: 'Projects Hub icon'
  },
  {
    icon: 'TrendingUp',
    component: 'analytics-icon',
    description: 'Analytics icon'
  },
  {
    icon: 'Zap',
    component: 'ai-assistant-icon',
    description: 'AI Assistant icon'
  },
  {
    icon: 'Monitor',
    component: 'canvas-icon',
    description: 'Canvas icon'
  },
  {
    icon: 'DollarSign',
    component: 'financial-hub-icon',
    description: 'Financial Hub icon'
  },
  {
    icon: 'Wallet',
    component: 'financial-icon',
    description: 'Financial icon'
  },
  {
    icon: 'Receipt',
    component: 'invoices-icon',
    description: 'Invoices icon'
  },
  {
    icon: 'MessageSquare',
    component: 'messages-icon',
    description: 'Messages icon'
  }
];

/**
 * Create the GradientContainer component if it doesn't exist
 */
async function ensureGradientContainerExists() {
  const gradientContainerPath = path.join(COMPONENTS_DIR, 'ui', 'gradient-container.tsx');
  
  try {
    await access(gradientContainerPath, fs.constants.F_OK);
    console.log('✅ GradientContainer component already exists');
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
    await mkdir(path.dirname(gradientContainerPath), { recursive: true });
    await writeFile(gradientContainerPath, gradientContainerContent);
    console.log('✅ Created GradientContainer component');
  }
}

/**
 * Create a stub icon component
 * @param {string} iconName - Lucide icon name
 * @param {string} componentName - Component filename (without extension)
 * @param {string} description - Icon description
 */
async function createIconComponent(iconName, componentName, description) {
  const componentContent = `"use client"

import { ${iconName} } from "lucide-react"
import { GradientContainer } from "@/components/ui/gradient-container"

/**
 * ${description} component
 * This component wraps the ${iconName} icon from Lucide in a gradient container
 */
export function ${componentName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}({ 
  size = "md", 
  variant = "primary",
  className,
  ...props 
}) {
  return (
    <GradientContainer size={size} variant={variant} className={className} {...props}>
      <${iconName} className="h-4 w-4" />
    </GradientContainer>
  )
}

// Also export the raw icon for direct usage
export function ${componentName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}Raw(props) {
  return <${iconName} {...props} />
}
`;

  const componentPath = path.join(ICONS_DIR, `${componentName}.tsx`);
  
  // Create directory if it doesn't exist
  await mkdir(path.dirname(componentPath), { recursive: true });
  
  // Write component file
  await writeFile(componentPath, componentContent);
  
  console.log(`✅ Created ${componentName}.tsx with ${iconName} icon`);
}

/**
 * Create an index file to export all icon components
 */
async function createIconsIndexFile() {
  let indexContent = `"use client"

// This file exports all icon components for easy importing
`;

  // Add imports and exports for each icon
  for (const { icon, component } of MISSING_ICONS) {
    const componentName = component.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    indexContent += `import { ${componentName}, ${componentName}Raw } from "./${component}"\n`;
  }
  
  indexContent += `\nexport {\n`;
  
  // Add exports
  for (const { component } of MISSING_ICONS) {
    const componentName = component.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    indexContent += `  ${componentName},\n  ${componentName}Raw,\n`;
  }
  
  indexContent += `}\n`;
  
  const indexPath = path.join(ICONS_DIR, 'index.tsx');
  await writeFile(indexPath, indexContent);
  
  console.log('✅ Created icons index.tsx file');
}

/**
 * Create a helper script to import icons in existing components
 */
async function createHelperScript() {
  const helperContent = `#!/usr/bin/env node
/**
 * import-icons-helper.js
 * 
 * This script helps you import the icon components into your existing components.
 * Run this script after comprehensive-icon-fix.js to see usage examples.
 */

console.log('\\n📋 Icon Import Guide:\\n');

console.log('Step 1: Import the icon components in your file:');
console.log('import { ProjectsHubIcon, AnalyticsIcon, ... } from "@/components/icons"');

console.log('\\nStep 2: Use the icons in your components:');
console.log('<ProjectsHubIcon />  // With gradient container');
console.log('<ProjectsHubIconRaw className="h-5 w-5" />  // Raw icon without container');

console.log('\\nAvailable Icons:');
${MISSING_ICONS.map(({ icon, component }) => {
  const componentName = component.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return `console.log('- ${componentName} (${icon}): For ${component.replace(/-/g, ' ')}');`;
}).join('\n')}

console.log('\\n✨ All icons are now available in the @/components/icons directory!');
`;

  const helperPath = path.join(process.cwd(), 'import-icons-helper.js');
  await writeFile(helperPath, helperContent);
  
  console.log('✅ Created import-icons-helper.js');
}

/**
 * Main function to run the script
 */
async function main() {
  console.log('🚀 Starting comprehensive icon fix...');
  
  try {
    // Ensure the GradientContainer component exists
    await ensureGradientContainerExists();
    
    // Create each icon component
    for (const { icon, component, description } of MISSING_ICONS) {
      await createIconComponent(icon, component, description);
    }
    
    // Create index file
    await createIconsIndexFile();
    
    // Create helper script
    await createHelperScript();
    
    console.log('\n✅ All icon components created successfully!');
    console.log('📂 Location: ' + ICONS_DIR);
    console.log('\n🔍 Next steps:');
    console.log('1. Run: node import-icons-helper.js');
    console.log('2. Import the icons in your components');
    console.log('3. Run your tests to verify the icons are working');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
