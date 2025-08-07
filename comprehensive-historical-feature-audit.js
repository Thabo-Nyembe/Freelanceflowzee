#!/usr/bin/env node
/**
 * comprehensive-historical-feature-audit.js
 * 
 * A comprehensive tool to analyze the entire Git history of the KAZI platform,
 * identify all features ever developed, and ensure they are present in the
 * current application state.
 * 
 * This script performs:
 * 1. Complete Git history analysis (all 264+ commits)
 * 2. Detailed inventory of components, pages, and API routes
 * 3. Historical vs current feature comparison
 * 4. Comprehensive feature evolution timeline
 * 5. Missing feature identification and restoration recommendations
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const { execSync } = require('child_process');
const readline = require('readline');

// Convert fs functions to promise-based
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const access = util.promisify(fs.access);

// Configuration
const CONFIG = {
  rootDir: process.argv[2] || '.',
  outputDir: 'feature-audit-results',
  reportFile: 'comprehensive-feature-audit-report.md',
  jsonOutputFile: 'feature-inventory.json',
  csvOutputFile: 'feature-timeline.csv',
  componentsDir: 'components',
  appDir: 'app',
  libDir: 'lib',
  apiDir: 'app/api',
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  featurePatterns: [
    'feat:', 'feature:', 'add:', 'implement:', 'complete:',
    'enhancement:', 'introduce:', 'support:', 'enable:',
    '✨', '🚀', '🎯', '🎉', '⚡'
  ],
  bugFixPatterns: [
    'fix:', 'bugfix:', 'hotfix:', 'patch:', 'resolve:',
    'repair:', 'correct:', 'address:',
    '🔧', '🐛', '🚨', '🩹'
  ],
  refactorPatterns: [
    'refactor:', 'restructure:', 'reorganize:', 'redesign:',
    'rework:', 'rewrite:', 'optimize:', 'improve:',
    '♻️', '🔨', '⚙️'
  ],
  featureCategories: {
    'ai': ['ai', 'openai', 'anthropic', 'llm', 'gpt', 'claude', 'ml', 'machine learning', 'generative'],
    'analytics': ['analytics', 'chart', 'graph', 'dashboard', 'metric', 'kpi', 'report', 'insight'],
    'auth': ['auth', 'login', 'signup', 'register', 'password', 'permission', 'role'],
    'collaboration': ['collaboration', 'comment', 'share', 'team', 'real-time', 'presence', 'concurrent'],
    'communication': ['message', 'chat', 'notification', 'email', 'inbox', 'conversation'],
    'content': ['content', 'editor', 'markdown', 'wysiwyg', 'rich text', 'document'],
    'file-management': ['file', 'upload', 'download', 'storage', 'media', 'asset', 'document'],
    'financial': ['payment', 'invoice', 'subscription', 'billing', 'pricing', 'escrow', 'transaction'],
    'internationalization': ['i18n', 'internationalization', 'localization', 'language', 'translation'],
    'performance': ['performance', 'optimization', 'speed', 'cache', 'lazy', 'defer', 'bundle'],
    'projects': ['project', 'task', 'workflow', 'milestone', 'deadline', 'timeline', 'gantt'],
    'security': ['security', 'encryption', 'protection', 'vulnerability', 'audit', 'compliance'],
    'ui-ux': ['ui', 'ux', 'interface', 'design', 'theme', 'style', 'component', 'responsive'],
    'video': ['video', 'recording', 'streaming', 'playback', 'transcription', 'caption'],
  },
  gitDepth: 1000, // How far back in history to analyze
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  maxConcurrentProcesses: 5,
  timelineGranularity: 'day', // 'day', 'week', 'month'
};

// Logging utilities
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const logger = {
  debug: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.debug) {
      console.log(`${COLORS.dim}[DEBUG]${COLORS.reset} ${message}`);
    }
  },
  info: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.info) {
      console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${message}`);
    }
  },
  warn: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.warn) {
      console.log(`${COLORS.yellow}[WARN]${COLORS.reset} ${message}`);
    }
  },
  error: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.error) {
      console.log(`${COLORS.red}[ERROR]${COLORS.reset} ${message}`);
    }
  },
  success: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.info) {
      console.log(`${COLORS.green}[SUCCESS]${COLORS.reset} ${message}`);
    }
  },
  section: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.info) {
      console.log(`\n${COLORS.bgBlue}${COLORS.white}${COLORS.bright} ${message} ${COLORS.reset}\n`);
    }
  },
};

// Statistics tracking
const stats = {
  commitsAnalyzed: 0,
  featuresIdentified: 0,
  componentsAnalyzed: 0,
  pagesAnalyzed: 0,
  apiRoutesAnalyzed: 0,
  missingFeatures: 0,
  modifiedFeatures: 0,
  preservedFeatures: 0,
  startTime: Date.now(),
  endTime: null,
  errors: [],
  featuresByCategory: {},
  featureEvolution: {},
};

// Initialize feature categories
Object.keys(CONFIG.featureCategories).forEach(category => {
  stats.featuresByCategory[category] = {
    total: 0,
    present: 0,
    missing: 0,
    modified: 0,
  };
});

/**
 * Displays a progress bar in the console
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {number} barLength - Length of the progress bar
 */
function showProgressBar(current, total, barLength = 40) {
  const progress = Math.min(Math.floor((current / total) * barLength), barLength);
  const emptyProgress = barLength - progress;
  
  const progressBar = '█'.repeat(progress) + '░'.repeat(emptyProgress);
  const percentage = Math.floor((current / total) * 100);
  
  process.stdout.write(`\r${COLORS.cyan}[${progressBar}] ${percentage}% (${current}/${total})${COLORS.reset}`);
  
  if (current === total) {
    process.stdout.write('\n');
  }
}

/**
 * Executes a Git command and returns the result
 * @param {string} command - Git command to execute
 * @returns {string} - Command output
 */
function executeGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  } catch (error) {
    logger.error(`Git command failed: ${command}`);
    logger.error(`Error: ${error.message}`);
    return '';
  }
}

/**
 * Gets all commits from Git history
 * @returns {Array<Object>} - Array of commit objects
 */
function getAllCommits() {
  logger.info('Retrieving Git commit history...');
  
  const format = {
    hash: '%H',
    abbrevHash: '%h',
    authorName: '%an',
    authorEmail: '%ae',
    date: '%ai',
    subject: '%s',
    body: '%b'
  };
  
  const formatStr = Object.values(format).join('%x1f');
  const command = `git log --pretty=format:"${formatStr}" --max-count=${CONFIG.gitDepth} --reverse`;
  
  const output = executeGitCommand(command);
  if (!output) return [];
  
  const commits = output.split('\n').map(line => {
    const parts = line.split('\x1f');
    const commit = {};
    
    Object.keys(format).forEach((key, index) => {
      commit[key] = parts[index] || '';
    });
    
    // Parse date
    commit.dateObj = new Date(commit.date);
    
    // Categorize commit
    if (CONFIG.featurePatterns.some(pattern => 
      commit.subject.toLowerCase().includes(pattern.toLowerCase()))) {
      commit.type = 'feature';
    } else if (CONFIG.bugFixPatterns.some(pattern => 
      commit.subject.toLowerCase().includes(pattern.toLowerCase()))) {
      commit.type = 'bugfix';
    } else if (CONFIG.refactorPatterns.some(pattern => 
      commit.subject.toLowerCase().includes(pattern.toLowerCase()))) {
      commit.type = 'refactor';
    } else {
      commit.type = 'other';
    }
    
    return commit;
  });
  
  logger.success(`Retrieved ${commits.length} commits from Git history`);
  return commits;
}

/**
 * Gets files changed in a specific commit
 * @param {string} commitHash - Commit hash
 * @returns {Object} - Object with added, modified, and deleted files
 */
function getFilesChangedInCommit(commitHash) {
  const command = `git show --name-status ${commitHash}`;
  const output = executeGitCommand(command);
  
  const added = [];
  const modified = [];
  const deleted = [];
  
  if (!output) return { added, modified, deleted };
  
  const lines = output.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('A\t')) {
      added.push(line.substring(2));
    } else if (line.startsWith('M\t')) {
      modified.push(line.substring(2));
    } else if (line.startsWith('D\t')) {
      deleted.push(line.substring(2));
    }
  });
  
  return { added, modified, deleted };
}

/**
 * Extracts features mentioned in commit messages
 * @param {Array<Object>} commits - Array of commit objects
 * @returns {Array<Object>} - Array of feature objects
 */
function extractFeaturesFromCommits(commits) {
  logger.info('Extracting features from commit messages...');
  
  const features = [];
  
  commits.forEach(commit => {
    // Skip non-feature commits
    if (commit.type !== 'feature') return;
    
    // Get files changed in this commit
    const { added, modified } = getFilesChangedInCommit(commit.hash);
    
    // Extract feature name from commit subject
    let featureName = commit.subject;
    
    // Remove prefixes like "feat:", "feature:", etc.
    CONFIG.featurePatterns.forEach(pattern => {
      if (pattern.endsWith(':')) {
        const regex = new RegExp(`^${pattern}\\s*`, 'i');
        featureName = featureName.replace(regex, '');
      }
    });
    
    // Remove emojis
    featureName = featureName.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    
    // Determine feature category
    let category = 'other';
    const lowerFeatureName = featureName.toLowerCase();
    
    Object.entries(CONFIG.featureCategories).forEach(([cat, keywords]) => {
      if (keywords.some(keyword => lowerFeatureName.includes(keyword))) {
        category = cat;
      }
    });
    
    // Create feature object
    const feature = {
      name: featureName,
      category,
      commitHash: commit.hash,
      date: commit.dateObj,
      author: `${commit.authorName} <${commit.authorEmail}>`,
      files: {
        added: added.filter(file => 
          CONFIG.extensions.includes(path.extname(file).toLowerCase())
        ),
        modified: modified.filter(file => 
          CONFIG.extensions.includes(path.extname(file).toLowerCase())
        ),
      },
    };
    
    features.push(feature);
    
    // Update stats
    stats.featuresIdentified++;
    if (!stats.featuresByCategory[category]) {
      stats.featuresByCategory[category] = { total: 0, present: 0, missing: 0, modified: 0 };
    }
    stats.featuresByCategory[category].total++;
  });
  
  logger.success(`Extracted ${features.length} features from commit history`);
  return features;
}

/**
 * Recursively walks a directory and returns all files with specified extensions
 * @param {string} dir - Directory to walk
 * @param {string[]} extensions - File extensions to include
 * @returns {Promise<string[]>} - Array of file paths
 */
async function walkDirectory(dir, extensions) {
  const files = [];
  
  async function walk(currentDir) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and .git directories
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            await walk(fullPath);
          }
        } else if (entry.isFile() && extensions.includes(path.extname(entry.name).toLowerCase())) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      logger.error(`Error walking directory ${currentDir}: ${error.message}`);
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Scans current filesystem for components, pages, and API routes
 * @returns {Promise<Object>} - Object with components, pages, and apiRoutes
 */
async function scanCurrentFilesystem() {
  logger.section('Scanning Current Filesystem');
  
  const components = [];
  const pages = [];
  const apiRoutes = [];
  const libraries = [];
  
  // Scan components directory
  logger.info(`Scanning ${CONFIG.componentsDir} directory...`);
  try {
    const componentFiles = await walkDirectory(path.join(CONFIG.rootDir, CONFIG.componentsDir), CONFIG.extensions);
    
    for (const file of componentFiles) {
      const relativePath = path.relative(CONFIG.rootDir, file);
      const content = await readFile(file, 'utf8');
      
      // Simple component analysis
      const isReactComponent = content.includes('import React') || 
                              content.includes('from "react"') || 
                              content.includes('function') && content.includes('return') && 
                              (content.includes('JSX') || content.includes('<div') || content.includes('<>'));
      
      if (isReactComponent) {
        const lineCount = content.split('\n').length;
        
        // Determine component category
        let category = 'ui-ux'; // Default category
        const lowerContent = content.toLowerCase();
        
        Object.entries(CONFIG.featureCategories).forEach(([cat, keywords]) => {
          if (keywords.some(keyword => lowerContent.includes(keyword))) {
            category = cat;
          }
        });
        
        components.push({
          path: relativePath,
          name: path.basename(file, path.extname(file)),
          category,
          size: lineCount,
          lastModified: fs.statSync(file).mtime,
        });
        
        stats.componentsAnalyzed++;
      }
    }
    logger.success(`Found ${components.length} components`);
  } catch (error) {
    logger.error(`Error scanning components: ${error.message}`);
  }
  
  // Scan app directory for pages
  logger.info(`Scanning ${CONFIG.appDir} directory for pages...`);
  try {
    const pageFiles = await walkDirectory(path.join(CONFIG.rootDir, CONFIG.appDir), CONFIG.extensions);
    
    for (const file of pageFiles) {
      const relativePath = path.relative(CONFIG.rootDir, file);
      
      // Check if it's a page file (page.tsx, page.jsx, etc.)
      if (path.basename(file).startsWith('page.')) {
        const content = await readFile(file, 'utf8');
        const lineCount = content.split('\n').length;
        
        // Determine page category
        let category = 'ui-ux'; // Default category
        const lowerContent = content.toLowerCase();
        
        Object.entries(CONFIG.featureCategories).forEach(([cat, keywords]) => {
          if (keywords.some(keyword => lowerContent.includes(keyword))) {
            category = cat;
          }
        });
        
        pages.push({
          path: relativePath,
          route: relativePath
            .replace(CONFIG.appDir, '')
            .replace(/\/page\.(tsx|jsx|ts|js)$/, '')
            .replace(/\/(.*?)\/\[(.+?)\]/g, '/$1/:$2')
            .replace(/\/\[(.+?)\]/g, '/:$1'),
          category,
          size: lineCount,
          lastModified: fs.statSync(file).mtime,
        });
        
        stats.pagesAnalyzed++;
      }
    }
    logger.success(`Found ${pages.length} pages`);
  } catch (error) {
    logger.error(`Error scanning pages: ${error.message}`);
  }
  
  // Scan API routes
  logger.info(`Scanning ${CONFIG.apiDir} directory for API routes...`);
  try {
    const apiFiles = await walkDirectory(path.join(CONFIG.rootDir, CONFIG.apiDir), CONFIG.extensions);
    
    for (const file of apiFiles) {
      const relativePath = path.relative(CONFIG.rootDir, file);
      
      // Check if it's a route file (route.tsx, route.jsx, etc.)
      if (path.basename(file).startsWith('route.')) {
        const content = await readFile(file, 'utf8');
        const lineCount = content.split('\n').length;
        
        // Determine API category
        let category = 'api'; // Default category
        const lowerContent = content.toLowerCase();
        
        Object.entries(CONFIG.featureCategories).forEach(([cat, keywords]) => {
          if (keywords.some(keyword => lowerContent.includes(keyword))) {
            category = cat;
          }
        });
        
        // Check for HTTP methods
        const methods = [];
        if (content.includes('export async function GET') || content.includes('export function GET')) methods.push('GET');
        if (content.includes('export async function POST') || content.includes('export function POST')) methods.push('POST');
        if (content.includes('export async function PUT') || content.includes('export function PUT')) methods.push('PUT');
        if (content.includes('export async function DELETE') || content.includes('export function DELETE')) methods.push('DELETE');
        if (content.includes('export async function PATCH') || content.includes('export function PATCH')) methods.push('PATCH');
        
        apiRoutes.push({
          path: relativePath,
          route: relativePath
            .replace(CONFIG.apiDir, '')
            .replace(/\/route\.(tsx|jsx|ts|js)$/, '')
            .replace(/\/(.*?)\/\[(.+?)\]/g, '/$1/:$2')
            .replace(/\/\[(.+?)\]/g, '/:$1'),
          category,
          methods,
          size: lineCount,
          lastModified: fs.statSync(file).mtime,
        });
        
        stats.apiRoutesAnalyzed++;
      }
    }
    logger.success(`Found ${apiRoutes.length} API routes`);
  } catch (error) {
    logger.error(`Error scanning API routes: ${error.message}`);
  }
  
  // Scan library files
  logger.info(`Scanning ${CONFIG.libDir} directory for libraries...`);
  try {
    const libFiles = await walkDirectory(path.join(CONFIG.rootDir, CONFIG.libDir), CONFIG.extensions);
    
    for (const file of libFiles) {
      const relativePath = path.relative(CONFIG.rootDir, file);
      const content = await readFile(file, 'utf8');
      const lineCount = content.split('\n').length;
      
      // Determine library category
      let category = 'other'; // Default category
      const lowerContent = content.toLowerCase();
      
      Object.entries(CONFIG.featureCategories).forEach(([cat, keywords]) => {
        if (keywords.some(keyword => lowerContent.includes(keyword))) {
          category = cat;
        }
      });
      
      libraries.push({
        path: relativePath,
        name: path.basename(file, path.extname(file)),
        category,
        size: lineCount,
        lastModified: fs.statSync(file).mtime,
      });
    }
    logger.success(`Found ${libraries.length} library files`);
  } catch (error) {
    logger.error(`Error scanning libraries: ${error.message}`);
  }
  
  return { components, pages, apiRoutes, libraries };
}

/**
 * Checks if a file exists in the current filesystem
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} - Whether the file exists
 */
async function fileExists(filePath) {
  try {
    await access(path.join(CONFIG.rootDir, filePath), fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Compares historical features with current filesystem
 * @param {Array<Object>} features - Array of historical features
 * @param {Object} currentState - Current filesystem state
 * @returns {Promise<Object>} - Comparison results
 */
async function compareFeatures(features, currentState) {
  logger.section('Comparing Historical Features with Current State');
  
  const results = {
    present: [],
    missing: [],
    modified: [],
  };
  
  // Create lookup maps for current components, pages, and API routes
  const componentMap = new Map();
  currentState.components.forEach(component => {
    componentMap.set(component.path, component);
  });
  
  const pageMap = new Map();
  currentState.pages.forEach(page => {
    pageMap.set(page.path, page);
  });
  
  const apiRouteMap = new Map();
  currentState.apiRoutes.forEach(route => {
    apiRouteMap.set(route.path, route);
  });
  
  // Process each historical feature
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    showProgressBar(i + 1, features.length);
    
    const featureFiles = [...feature.files.added, ...feature.files.modified];
    let missingCount = 0;
    let presentCount = 0;
    let modifiedCount = 0;
    
    // Check each file in the feature
    for (const file of featureFiles) {
      const exists = await fileExists(file);
      
      if (!exists) {
        missingCount++;
        continue;
      }
      
      // File exists, check if it's a component, page, or API route
      if (file.startsWith(CONFIG.componentsDir)) {
        const component = componentMap.get(file);
        if (component) {
          presentCount++;
        } else {
          modifiedCount++;
        }
      } else if (file.startsWith(CONFIG.appDir)) {
        if (file.includes('/api/') && file.includes('route.')) {
          const apiRoute = apiRouteMap.get(file);
          if (apiRoute) {
            presentCount++;
          } else {
            modifiedCount++;
          }
        } else if (file.includes('page.')) {
          const page = pageMap.get(file);
          if (page) {
            presentCount++;
          } else {
            modifiedCount++;
          }
        } else {
          // Other app files
          presentCount++;
        }
      } else {
        // Other files
        presentCount++;
      }
    }
    
    // Determine overall feature status
    if (missingCount > 0 && missingCount === featureFiles.length) {
      // All files missing
      results.missing.push({
        ...feature,
        status: 'missing',
        missingFiles: featureFiles,
      });
      stats.missingFeatures++;
      stats.featuresByCategory[feature.category].missing++;
    } else if (missingCount > 0) {
      // Some files missing
      results.modified.push({
        ...feature,
        status: 'modified',
        missingFiles: featureFiles.filter(async file => !(await fileExists(file))),
        presentFiles: featureFiles.filter(async file => await fileExists(file)),
      });
      stats.modifiedFeatures++;
      stats.featuresByCategory[feature.category].modified++;
    } else {
      // All files present
      results.present.push({
        ...feature,
        status: 'present',
      });
      stats.preservedFeatures++;
      stats.featuresByCategory[feature.category].present++;
    }
  }
  
  logger.success(`Comparison complete: ${results.present.length} present, ${results.modified.length} modified, ${results.missing.length} missing`);
  return results;
}

/**
 * Creates a feature evolution timeline
 * @param {Array<Object>} features - Array of feature objects
 * @param {string} granularity - Timeline granularity ('day', 'week', 'month')
 * @returns {Object} - Timeline object
 */
function createFeatureTimeline(features, granularity = 'day') {
  logger.info('Creating feature evolution timeline...');
  
  const timeline = {};
  
  features.forEach(feature => {
    let timeKey;
    const date = feature.date;
    
    if (granularity === 'day') {
      timeKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (granularity === 'week') {
      // Get the Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      const monday = new Date(date);
      monday.setDate(diff);
      timeKey = monday.toISOString().split('T')[0]; // YYYY-MM-DD of Monday
    } else if (granularity === 'month') {
      timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    }
    
    if (!timeline[timeKey]) {
      timeline[timeKey] = {
        features: [],
        categories: {},
      };
    }
    
    timeline[timeKey].features.push(feature);
    
    if (!timeline[timeKey].categories[feature.category]) {
      timeline[timeKey].categories[feature.category] = 0;
    }
    timeline[timeKey].categories[feature.category]++;
  });
  
  // Sort timeline by date
  const sortedTimeline = {};
  Object.keys(timeline)
    .sort()
    .forEach(key => {
      sortedTimeline[key] = timeline[key];
    });
  
  stats.featureEvolution = sortedTimeline;
  logger.success('Feature timeline created');
  return sortedTimeline;
}

/**
 * Generates recommendations for missing features
 * @param {Array<Object>} missingFeatures - Array of missing features
 * @returns {Array<Object>} - Array of recommendations
 */
function generateRecommendations(missingFeatures) {
  logger.info('Generating recommendations for missing features...');
  
  const recommendations = [];
  
  // Group missing features by category
  const featuresByCategory = {};
  
  missingFeatures.forEach(feature => {
    if (!featuresByCategory[feature.category]) {
      featuresByCategory[feature.category] = [];
    }
    featuresByCategory[feature.category].push(feature);
  });
  
  // Generate recommendations for each category
  Object.entries(featuresByCategory).forEach(([category, features]) => {
    // Sort features by date (newest first)
    features.sort((a, b) => b.date - a.date);
    
    const recommendation = {
      category,
      featureCount: features.length,
      criticalFeatures: features.slice(0, 3), // Top 3 most recent
      totalFiles: features.reduce((acc, feature) => acc + feature.missingFiles.length, 0),
      recommendedAction: features.length > 5 ? 'high' : features.length > 2 ? 'medium' : 'low',
    };
    
    recommendations.push(recommendation);
  });
  
  // Sort recommendations by priority (high to low)
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.recommendedAction] - priorityOrder[b.recommendedAction];
  });
  
  logger.success(`Generated ${recommendations.length} recommendations`);
  return recommendations;
}

/**
 * Generates a comprehensive feature audit report
 * @param {Object} comparisonResults - Feature comparison results
 * @param {Object} currentState - Current filesystem state
 * @param {Object} timeline - Feature evolution timeline
 * @param {Array<Object>} recommendations - Recommendations for missing features
 * @returns {Promise<void>}
 */
async function generateReport(comparisonResults, currentState, timeline, recommendations) {
  logger.section('Generating Comprehensive Feature Audit Report');
  
  // Create output directory if it doesn't exist
  try {
    await mkdir(CONFIG.outputDir, { recursive: true });
  } catch (error) {
    logger.error(`Error creating output directory: ${error.message}`);
    return;
  }
  
  // Calculate duration
  const duration = (stats.endTime - stats.startTime) / 1000; // in seconds
  
  // Generate markdown report
  const report = [
    '# Comprehensive Historical Feature Audit Report',
    '',
    `**Date:** ${new Date().toISOString().split('T')[0]}`,
    `**Duration:** ${duration.toFixed(2)} seconds`,
    '',
    '## 1. Executive Summary',
    '',
    'This report presents a comprehensive analysis of all features developed throughout the history of the KAZI platform, comparing historical features with the current application state to ensure all functionality is preserved.',
    '',
    '### Key Findings',
    '',
    `- **Total Features Analyzed:** ${stats.featuresIdentified}`,
    `- **Present Features:** ${stats.preservedFeatures} (${Math.round(stats.preservedFeatures / stats.featuresIdentified * 100)}%)`,
    `- **Modified Features:** ${stats.modifiedFeatures} (${Math.round(stats.modifiedFeatures / stats.featuresIdentified * 100)}%)`,
    `- **Missing Features:** ${stats.missingFeatures} (${Math.round(stats.missingFeatures / stats.featuresIdentified * 100)}%)`,
    '',
    '### Current Application State',
    '',
    `- **Components:** ${currentState.components.length}`,
    `- **Pages:** ${currentState.pages.length}`,
    `- **API Routes:** ${currentState.apiRoutes.length}`,
    `- **Libraries:** ${currentState.libraries.length}`,
    '',
    '## 2. Feature Categories Analysis',
    '',
    '| Category | Total Features | Present | Modified | Missing |',
    '|----------|----------------|---------|----------|---------|',
  ];
  
  // Add feature categories
  Object.entries(stats.featuresByCategory).forEach(([category, counts]) => {
    if (counts.total > 0) {
      report.push(`| ${category} | ${counts.total} | ${counts.present} | ${counts.modified} | ${counts.missing} |`);
    }
  });
  
  report.push(
    '',
    '## 3. Feature Evolution Timeline',
    '',
    'The following timeline shows the evolution of features throughout the development history:',
    '',
  );
  
  // Add timeline
  Object.entries(timeline).forEach(([date, data]) => {
    report.push(`### ${date}`);
    report.push('');
    
    // Add category breakdown
    report.push('**Categories:**');
    report.push('');
    
    Object.entries(data.categories).forEach(([category, count]) => {
      report.push(`- ${category}: ${count} features`);
    });
    
    report.push('');
    report.push('**Features:**');
    report.push('');
    
    data.features.forEach(feature => {
      report.push(`- ${feature.name} (${feature.category})`);
    });
    
    report.push('');
  });
  
  report.push(
    '## 4. Missing Features',
    '',
  );
  
  if (comparisonResults.missing.length === 0) {
    report.push('No missing features detected. All historical features are present in the current application state.');
  } else {
    report.push('The following features are missing from the current application state:');
    report.push('');
    
    comparisonResults.missing.forEach(feature => {
      report.push(`### ${feature.name}`);
      report.push('');
      report.push(`- **Category:** ${feature.category}`);
      report.push(`- **Date:** ${feature.date.toISOString().split('T')[0]}`);
      report.push(`- **Commit:** ${feature.commitHash}`);
      report.push(`- **Author:** ${feature.author}`);
      report.push('');
      report.push('**Missing Files:**');
      report.push('');
      
      feature.missingFiles.forEach(file => {
        report.push(`- ${file}`);
      });
      
      report.push('');
    });
  }
  
  report.push(
    '## 5. Recommendations',
    '',
  );
  
  if (recommendations.length === 0) {
    report.push('No recommendations needed. All historical features are present in the current application state.');
  } else {
    recommendations.forEach(recommendation => {
      report.push(`### ${recommendation.category} (${recommendation.recommendedAction.toUpperCase()} Priority)`);
      report.push('');
      report.push(`- **Missing Features:** ${recommendation.featureCount}`);
      report.push(`- **Total Missing Files:** ${recommendation.totalFiles}`);
      report.push('');
      report.push('**Critical Features to Restore:**');
      report.push('');
      
      recommendation.criticalFeatures.forEach(feature => {
        report.push(`- ${feature.name} (${feature.date.toISOString().split('T')[0]})`);
      });
      
      report.push('');
    });
  }
  
  report.push(
    '## 6. Detailed Inventory',
    '',
    '### Components',
    '',
    '| Component | Category | Size (Lines) | Last Modified |',
    '|-----------|----------|--------------|--------------|',
  );
  
  // Add top 20 components by size
  currentState.components
    .sort((a, b) => b.size - a.size)
    .slice(0, 20)
    .forEach(component => {
      report.push(`| ${component.name} | ${component.category} | ${component.size} | ${component.lastModified.toISOString().split('T')[0]} |`);
    });
  
  report.push(
    '',
    '### Pages',
    '',
    '| Route | Category | Size (Lines) |',
    '|-------|----------|--------------|',
  );
  
  // Add pages
  currentState.pages
    .sort((a, b) => a.route.localeCompare(b.route))
    .forEach(page => {
      report.push(`| ${page.route} | ${page.category} | ${page.size} |`);
    });
  
  report.push(
    '',
    '### API Routes',
    '',
    '| Route | Category | Methods | Size (Lines) |',
    '|-------|----------|---------|--------------|',
  );
  
  // Add API routes
  currentState.apiRoutes
    .sort((a, b) => a.route.localeCompare(b.route))
    .forEach(route => {
      report.push(`| ${route.route} | ${route.category} | ${route.methods.join(', ')} | ${route.size} |`);
    });
  
  report.push(
    '',
    '## 7. Conclusion',
    '',
  );
  
  if (stats.missingFeatures === 0) {
    report.push('The KAZI platform has successfully maintained all features developed throughout its history. The application is in excellent condition with no missing functionality.');
  } else if (stats.missingFeatures < 5) {
    report.push(`The KAZI platform has maintained most of its historical features, with only ${stats.missingFeatures} missing features. These can be restored following the recommendations in this report to achieve 100% feature preservation.`);
  } else {
    report.push(`The KAZI platform is missing ${stats.missingFeatures} historical features. A systematic restoration effort is recommended, prioritizing the high-priority categories identified in this report.`);
  }
  
  report.push(
    '',
    '---',
    '',
    `Generated by comprehensive-historical-feature-audit.js on ${new Date().toISOString()}`,
  );
  
  // Write report to file
  try {
    await writeFile(path.join(CONFIG.outputDir, CONFIG.reportFile), report.join('\n'), 'utf8');
    logger.success(`Report generated: ${path.join(CONFIG.outputDir, CONFIG.reportFile)}`);
  } catch (error) {
    logger.error(`Error writing report: ${error.message}`);
  }
  
  // Generate JSON output
  const jsonOutput = {
    stats,
    comparisonResults,
    currentState,
    timeline,
    recommendations,
  };
  
  try {
    await writeFile(
      path.join(CONFIG.outputDir, CONFIG.jsonOutputFile),
      JSON.stringify(jsonOutput, null, 2),
      'utf8'
    );
    logger.success(`JSON data generated: ${path.join(CONFIG.outputDir, CONFIG.jsonOutputFile)}`);
  } catch (error) {
    logger.error(`Error writing JSON data: ${error.message}`);
  }
  
  // Generate CSV timeline
  const csvRows = ['Date,Category,FeatureCount,FeatureNames'];
  
  Object.entries(timeline).forEach(([date, data]) => {
    Object.entries(data.categories).forEach(([category, count]) => {
      const featureNames = data.features
        .filter(f => f.category === category)
        .map(f => f.name.replace(/,/g, ';'))
        .join('|');
      
      csvRows.push(`${date},${category},${count},"${featureNames}"`);
    });
  });
  
  try {
    await writeFile(
      path.join(CONFIG.outputDir, CONFIG.csvOutputFile),
      csvRows.join('\n'),
      'utf8'
    );
    logger.success(`CSV timeline generated: ${path.join(CONFIG.outputDir, CONFIG.csvOutputFile)}`);
  } catch (error) {
    logger.error(`Error writing CSV timeline: ${error.message}`);
  }
}

/**
 * Main function to run the feature audit
 */
async function main() {
  try {
    logger.section('Starting Comprehensive Historical Feature Audit');
    
    // Create output directory if it doesn't exist
    await mkdir(CONFIG.outputDir, { recursive: true });
    
    // Step 1: Get all commits from Git history
    const commits = getAllCommits();
    stats.commitsAnalyzed = commits.length;
    
    // Step 2: Extract features from commit messages
    const features = extractFeaturesFromCommits(commits);
    
    // Step 3: Scan current filesystem
    const currentState = await scanCurrentFilesystem();
    
    // Step 4: Compare historical features with current state
    const comparisonResults = await compareFeatures(features, currentState);
    
    // Step 5: Create feature evolution timeline
    const timeline = createFeatureTimeline(features, CONFIG.timelineGranularity);
    
    // Step 6: Generate recommendations
    const recommendations = generateRecommendations(comparisonResults.missing);
    
    // Step 7: Generate comprehensive report
    stats.endTime = Date.now();
    await generateReport(comparisonResults, currentState, timeline, recommendations);
    
    logger.section('Feature Audit Complete');
    logger.info(`Commits analyzed: ${stats.commitsAnalyzed}`);
    logger.info(`Features identified: ${stats.featuresIdentified}`);
    logger.info(`Components analyzed: ${stats.componentsAnalyzed}`);
    logger.info(`Pages analyzed: ${stats.pagesAnalyzed}`);
    logger.info(`API routes analyzed: ${stats.apiRoutesAnalyzed}`);
    logger.info(`Present features: ${stats.preservedFeatures}`);
    logger.info(`Modified features: ${stats.modifiedFeatures}`);
    logger.info(`Missing features: ${stats.missingFeatures}`);
    
    if (stats.missingFeatures === 0) {
      logger.success('All historical features are present in the current application!');
    } else {
      logger.warn(`${stats.missingFeatures} historical features are missing. See the report for details.`);
    }
    
    logger.info(`Reports generated in ${CONFIG.outputDir}/`);
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  logger.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
