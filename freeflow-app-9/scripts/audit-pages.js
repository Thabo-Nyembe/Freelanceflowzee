#!/usr/bin/env node

/**
 * KAZI Platform - Dashboard Pages Audit Script
 * 
 * This script analyzes which dashboard pages exist versus which ones are referenced
 * in the features list. It helps identify missing placeholder pages that need to be created.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Path to the dashboard directory
const dashboardPath = path.join(__dirname, '..', 'app', '(app)', 'dashboard');

// All expected pages from the dashboard features list
const expectedPages = {
  core: ['my-day', 'projects-hub', 'analytics', 'time-tracking'],
  ai: ['ai-create', 'ai-design', 'ai-assistant', 'ai-enhanced'],
  creative: ['video-studio', 'canvas', 'canvas-collaboration', 'gallery', 'cv-portfolio'],
  business: ['financial-hub', 'financial', 'invoices', 'escrow', 'bookings', 'booking'],
  communication: ['messages', 'collaboration', 'team-hub', 'team', 'client-zone', 'clients'],
  storage: ['files-hub', 'files', 'cloud-storage', 'storage'],
  productivity: ['workflow-builder', 'notifications', 'calendar'],
  community: ['community-hub', 'community'],
  settings: ['settings', 'profile'],
  advanced: ['team-management', 'project-templates', 'client-portal', 'resource-library', 'performance-analytics']
};

// Flatten the expected pages into a single array
const allExpectedPages = Object.values(expectedPages).flat();

// Function to get existing dashboard pages
function getExistingPages() {
  try {
    return fs.readdirSync(dashboardPath)
      .filter(item => {
        const itemPath = path.join(dashboardPath, item);
        return fs.statSync(itemPath).isDirectory() || 
               (fs.statSync(itemPath).isFile() && item === 'page.tsx');
      })
      .map(item => item === 'page.tsx' ? 'index' : item);
  } catch (error) {
    console.error(`${colors.red}Error reading dashboard directory:${colors.reset}`, error);
    return [];
  }
}

// Function to find missing pages
function findMissingPages(existingPages) {
  return allExpectedPages.filter(page => !existingPages.includes(page));
}

// Function to check if page has proper index file
function checkPageStructure(pageName) {
  const pagePath = path.join(dashboardPath, pageName);
  
  if (!fs.existsSync(pagePath)) {
    return { exists: false, hasIndexFile: false };
  }
  
  const indexPath = path.join(pagePath, 'page.tsx');
  return { 
    exists: true, 
    hasIndexFile: fs.existsSync(indexPath)
  };
}

// Function to check if page has proper icon imports
function checkPageIcons(pageName) {
  const pagePath = path.join(dashboardPath, pageName, 'page.tsx');
  
  if (!fs.existsSync(pagePath)) {
    return { hasLucideImport: false, iconCount: 0 };
  }
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    const hasLucideImport = content.includes("from 'lucide-react'");
    const iconMatches = content.match(/<([A-Z][a-zA-Z]*)\s+className=/g) || [];
    return { 
      hasLucideImport, 
      iconCount: iconMatches.length
    };
  } catch (error) {
    return { hasLucideImport: false, iconCount: 0 };
  }
}

// Generate placeholder template for missing pages
function generatePlaceholderTemplate(pageName) {
  // Find which category this page belongs to
  let category = '';
  for (const [cat, pages] of Object.entries(expectedPages)) {
    if (pages.includes(pageName)) {
      category = cat;
      break;
    }
  }
  
  // Convert page name to title case
  const pageTitle = pageName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Determine appropriate icon based on page name or category
  let icon = 'LayoutDashboard';
  if (pageName.includes('file')) icon = 'FileText';
  else if (pageName.includes('ai')) icon = 'Brain';
  else if (pageName.includes('video')) icon = 'Video';
  else if (pageName.includes('analytics')) icon = 'BarChart';
  else if (pageName.includes('financial') || pageName.includes('invoice')) icon = 'DollarSign';
  else if (pageName.includes('team') || pageName.includes('client')) icon = 'Users';
  else if (pageName.includes('calendar')) icon = 'Calendar';
  else if (pageName.includes('message')) icon = 'MessageSquare';
  else if (pageName.includes('notification')) icon = 'Bell';
  else if (pageName.includes('community')) icon = 'Globe';
  else if (pageName.includes('setting')) icon = 'Settings';
  else if (pageName.includes('profile')) icon = 'User';
  else if (pageName.includes('storage')) icon = 'Database';
  else if (pageName.includes('cloud')) icon = 'Cloud';
  else if (pageName.includes('workflow')) icon = 'GitBranch';
  else if (pageName.includes('gallery')) icon = 'Image';
  else if (pageName.includes('cv')) icon = 'FileText';
  else if (pageName.includes('day')) icon = 'Calendar';
  else if (pageName.includes('project')) icon = 'Folder';
  else if (pageName.includes('template')) icon = 'Copy';
  else if (pageName.includes('resource')) icon = 'Library';
  else if (pageName.includes('performance')) icon = 'TrendingUp';
  else if (pageName.includes('escrow')) icon = 'Shield';
  else if (pageName.includes('booking')) icon = 'Calendar';
  else if (pageName.includes('collaboration')) icon = 'Users';
  else if (pageName.includes('canvas')) icon = 'Palette';
  
  return `"use client"

import React from 'react'
import { ${icon}, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard } from '@/components/ui/enhanced-card'

export default function ${pageTitle.replace(/\s/g, '')}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">${pageTitle}</h1>
          <p className="text-muted-foreground">
            ${category.charAt(0).toUpperCase() + category.slice(1)} feature for the KAZI platform
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          Coming Soon
        </Badge>
      </div>
      
      <EnhancedCard className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <${icon} className="h-5 w-5 text-primary" />
            <CardTitle>${pageTitle} Dashboard</CardTitle>
          </div>
          <CardDescription>
            Access all your ${pageTitle.toLowerCase()} features in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <${icon} className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              ${pageTitle} Feature
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              This feature is currently in development. Check back soon for updates!
            </p>
            <Button className="gap-2">
              Explore Features <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </EnhancedCard>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Advanced ${pageTitle.toLowerCase()} management</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Seamless integration with other KAZI tools</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Real-time collaboration capabilities</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>AI-powered productivity enhancements</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our team is working hard to bring you the best ${pageTitle.toLowerCase()} experience.
              This feature will be available in the next platform update.
            </p>
            <Button variant="outline" className="w-full">
              Request Early Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}`;
}

// Main function
async function main() {
  console.log(`\n${colors.bold}${colors.cyan}KAZI PLATFORM - DASHBOARD PAGES AUDIT${colors.reset}\n`);
  
  // Get existing pages
  const existingPages = getExistingPages();
  console.log(`${colors.green}Found ${existingPages.length} existing dashboard pages${colors.reset}`);
  
  // Find missing pages
  const missingPages = findMissingPages(existingPages);
  console.log(`${colors.yellow}Identified ${missingPages.length} missing dashboard pages${colors.reset}\n`);
  
  // Check structure of existing pages
  console.log(`${colors.bold}EXISTING PAGES STRUCTURE CHECK:${colors.reset}`);
  const structureIssues = [];
  const iconIssues = [];
  
  for (const page of existingPages) {
    if (page === 'index') continue;
    
    const structure = checkPageStructure(page);
    const icons = checkPageIcons(page);
    
    if (!structure.hasIndexFile) {
      structureIssues.push(page);
      console.log(`${colors.red}✗ ${page} - Missing page.tsx file${colors.reset}`);
    } else if (!icons.hasLucideImport || icons.iconCount === 0) {
      iconIssues.push(page);
      console.log(`${colors.yellow}⚠ ${page} - Missing Lucide icon imports or usage${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ ${page} - Structure OK with ${icons.iconCount} icons${colors.reset}`);
    }
  }
  
  // Report on missing pages
  console.log(`\n${colors.bold}MISSING PAGES:${colors.reset}`);
  if (missingPages.length === 0) {
    console.log(`${colors.green}No missing pages! All expected dashboard pages exist.${colors.reset}`);
  } else {
    for (const page of missingPages) {
      console.log(`${colors.yellow}⚠ ${page} - Page directory needed${colors.reset}`);
    }
    
    // Generate report
    console.log(`\n${colors.bold}GENERATING PLACEHOLDER TEMPLATES:${colors.reset}`);
    
    for (const page of missingPages) {
      const template = generatePlaceholderTemplate(page);
      const pageDirPath = path.join(dashboardPath, page);
      const pageFilePath = path.join(pageDirPath, 'page.tsx');
      
      try {
        if (!fs.existsSync(pageDirPath)) {
          fs.mkdirSync(pageDirPath, { recursive: true });
        }
        
        fs.writeFileSync(pageFilePath, template);
        console.log(`${colors.green}✓ Created placeholder for ${page}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}Error creating placeholder for ${page}:${colors.reset}`, error);
      }
    }
  }
  
  // Summary
  console.log(`\n${colors.bold}${colors.cyan}AUDIT SUMMARY:${colors.reset}`);
  console.log(`${colors.white}Total expected pages: ${allExpectedPages.length}${colors.reset}`);
  console.log(`${colors.green}Existing pages: ${existingPages.length - 1}${colors.reset}`); // -1 for index
  console.log(`${colors.yellow}Missing pages: ${missingPages.length}${colors.reset}`);
  console.log(`${colors.red}Pages with structure issues: ${structureIssues.length}${colors.reset}`);
  console.log(`${colors.magenta}Pages with icon issues: ${iconIssues.length}${colors.reset}`);
  
  if (missingPages.length === 0 && structureIssues.length === 0 && iconIssues.length === 0) {
    console.log(`\n${colors.bold}${colors.green}✓ ALL DASHBOARD PAGES ARE COMPLETE AND PROPERLY STRUCTURED!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.bold}${colors.yellow}⚠ Some issues need to be addressed. See details above.${colors.reset}\n`);
  }
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
