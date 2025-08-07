#!/usr/bin/env node
/**
 * intelligent-feature-mapping-audit.js
 * 
 * An intelligent tool that maps historical features to current functionality
 * through semantic analysis rather than just file path matching.
 * 
 * This script:
 * 1. Analyzes historical Git commits to identify features
 * 2. Scans current codebase for components, pages, and API routes
 * 3. Uses semantic analysis to map historical features to current functionality
 * 4. Categorizes features as PRESENT, EVOLVED, CONSOLIDATED, or TRULY_MISSING
 * 5. Generates a comprehensive report showing what features are actually present,
 *    evolved, consolidated, or missing with restoration recommendations
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
  outputDir: 'feature-mapping-results',
  reportFile: 'intelligent-feature-mapping-report.md',
  jsonOutputFile: 'feature-mapping-inventory.json',
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
  businessFunctionality: {
    'payment': [
      'payment', 'stripe', 'checkout', 'billing', 'subscription', 'invoice',
      'pricing', 'transaction', 'escrow', 'financial', 'premium', 'unlock'
    ],
    'authentication': [
      'auth', 'login', 'signup', 'register', 'password', 'permission', 'role',
      'user', 'account', 'profile', 'session', 'token', 'jwt', 'oauth'
    ],
    'dashboard': [
      'dashboard', 'overview', 'stats', 'metrics', 'kpi', 'performance',
      'summary', 'home', 'landing', 'main', 'hub', 'central'
    ],
    'ai': [
      'ai', 'openai', 'anthropic', 'llm', 'gpt', 'claude', 'ml', 'machine learning',
      'generative', 'intelligent', 'smart', 'predict', 'analyze', 'insight'
    ],
    'video': [
      'video', 'recording', 'streaming', 'playback', 'transcription', 'caption',
      'studio', 'editor', 'player', 'media', 'film', 'camera', 'screen'
    ],
    'collaboration': [
      'collaboration', 'comment', 'share', 'team', 'real-time', 'presence',
      'concurrent', 'feedback', 'review', 'approve', 'workflow', 'together'
    ],
    'file-management': [
      'file', 'upload', 'download', 'storage', 'media', 'asset', 'document',
      's3', 'wasabi', 'cloud', 'bucket', 'folder', 'directory', 'attachment'
    ],
    'analytics': [
      'analytics', 'chart', 'graph', 'dashboard', 'metric', 'kpi', 'report',
      'insight', 'tracking', 'monitor', 'measure', 'performance', 'stats'
    ],
    'ui-components': [
      'ui', 'component', 'interface', 'design', 'theme', 'style', 'layout',
      'responsive', 'mobile', 'desktop', 'button', 'form', 'input', 'modal'
    ],
    'internationalization': [
      'i18n', 'internationalization', 'localization', 'language', 'translation',
      'locale', 'multilingual', 'global', 'region', 'country'
    ],
    'security': [
      'security', 'encryption', 'protection', 'vulnerability', 'audit', 'compliance',
      'firewall', 'csrf', 'xss', 'sanitize', 'validate', 'secure', 'safety'
    ],
    'performance': [
      'performance', 'optimization', 'speed', 'cache', 'lazy', 'defer', 'bundle',
      'minify', 'compress', 'throttle', 'debounce', 'efficient', 'fast'
    ]
  },
  featureMapping: {
    // Maps historical feature patterns to current implementation patterns
    'payment-system': [
      'app/api/payment', 'app/api/payments', 'app/api/stripe',
      'components/payment', 'components/escrow', 'components/financial',
      'components/invoice', 'components/pricing', 'components/subscription'
    ],
    'authentication-system': [
      'app/api/auth', 'app/login', 'app/signup', 'app/logout',
      'components/auth', 'components/login', 'components/signup',
      'components/profile', 'lib/auth', 'hooks/use-auth'
    ],
    'dashboard-system': [
      'app/(app)/dashboard', 'components/dashboard', 'components/hubs',
      'components/overview', 'components/analytics-dashboard'
    ],
    'ai-system': [
      'app/api/ai', 'components/ai', 'lib/ai', 'hooks/use-ai',
      'components/openai', 'components/anthropic', 'components/generative'
    ],
    'video-system': [
      'app/api/video', 'app/video', 'app/video-studio',
      'components/video', 'components/recording', 'components/player',
      'components/studio', 'components/media'
    ],
    'collaboration-system': [
      'app/api/collaboration', 'components/collaboration',
      'components/feedback', 'components/team', 'components/comments',
      'components/review', 'components/presence'
    ],
    'file-management-system': [
      'app/api/files', 'app/api/storage', 'app/api/upload',
      'components/files', 'components/storage', 'components/upload',
      'components/download', 'components/cloud', 'lib/storage'
    ],
    'analytics-system': [
      'app/api/analytics', 'components/analytics', 'components/charts',
      'components/metrics', 'components/reports', 'lib/analytics'
    ]
  },
  gitDepth: 1000, // How far back in history to analyze
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  maxConcurrentProcesses: 5,
  semanticAnalysisDepth: 'deep', // 'shallow', 'medium', 'deep'
};

// Feature status categories
const FEATURE_STATUS = {
  PRESENT: 'PRESENT', // Feature exists in current form
  EVOLVED: 'EVOLVED', // Feature exists but in different structure/location
  CONSOLIDATED: 'CONSOLIDATED', // Feature merged into larger component
  TRULY_MISSING: 'TRULY_MISSING', // Feature genuinely not present
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
  presentFeatures: 0,
  evolvedFeatures: 0,
  consolidatedFeatures: 0,
  trulyMissingFeatures: 0,
  startTime: Date.now(),
  endTime: null,
  errors: [],
  featuresByCategory: {},
  featureMapping: {},
};

// Initialize feature categories
Object.keys(CONFIG.businessFunctionality).forEach(category => {
  stats.featuresByCategory[category] = {
    total: 0,
    present: 0,
    evolved: 0,
    consolidated: 0,
    missing: 0,
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
    
    // Determine business functionality category
    let businessCategory = 'other';
    const lowerFeatureName = featureName.toLowerCase();
    
    Object.entries(CONFIG.businessFunctionality).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowerFeatureName.includes(keyword))) {
        businessCategory = category;
      }
    });
    
    // Create feature object
    const feature = {
      name: featureName,
      businessCategory,
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
    if (!stats.featuresByCategory[businessCategory]) {
      stats.featuresByCategory[businessCategory] = { total: 0, present: 0, evolved: 0, consolidated: 0, missing: 0 };
    }
    stats.featuresByCategory[businessCategory].total++;
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
 * @returns {Promise<Object>} - Object with components, pages, apiRoutes, and libraries
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
        
        // Determine business functionality category
        let businessCategory = 'ui-components'; // Default category
        const lowerContent = content.toLowerCase();
        
        Object.entries(CONFIG.businessFunctionality).forEach(([category, keywords]) => {
          if (keywords.some(keyword => lowerContent.includes(keyword))) {
            businessCategory = category;
          }
        });
        
        components.push({
          path: relativePath,
          name: path.basename(file, path.extname(file)),
          businessCategory,
          size: lineCount,
          lastModified: fs.statSync(file).mtime,
          content: content,
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
        
        // Determine business functionality category
        let businessCategory = 'ui-components'; // Default category
        const lowerContent = content.toLowerCase();
        
        Object.entries(CONFIG.businessFunctionality).forEach(([category, keywords]) => {
          if (keywords.some(keyword => lowerContent.includes(keyword))) {
            businessCategory = category;
          }
        });
        
        pages.push({
          path: relativePath,
          route: relativePath
            .replace(CONFIG.appDir, '')
            .replace(/\/page\.(tsx|jsx|ts|js)$/, '')
            .replace(/\/(.*?)\/\[(.+?)\]/g, '/$1/:$2')
            .replace(/\/\[(.+?)\]/g, '/:$1'),
          businessCategory,
          size: lineCount,
          lastModified: fs.statSync(file).mtime,
          content: content,
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
        
        // Determine business functionality category
        let businessCategory = 'api'; // Default category
        const lowerContent = content.toLowerCase();
        
        Object.entries(CONFIG.businessFunctionality).forEach(([category, keywords]) => {
          if (keywords.some(keyword => lowerContent.includes(keyword))) {
            businessCategory = category;
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
          businessCategory,
          methods,
          size: lineCount,
          lastModified: fs.statSync(file).mtime,
          content: content,
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
      
      // Determine business functionality category
      let businessCategory = 'other'; // Default category
      const lowerContent = content.toLowerCase();
      
      Object.entries(CONFIG.businessFunctionality).forEach(([category, keywords]) => {
        if (keywords.some(keyword => lowerContent.includes(keyword))) {
          businessCategory = category;
        }
      });
      
      libraries.push({
        path: relativePath,
        name: path.basename(file, path.extname(file)),
        businessCategory,
        size: lineCount,
        lastModified: fs.statSync(file).mtime,
        content: content,
      });
    }
    logger.success(`Found ${libraries.length} library files`);
  } catch (error) {
    logger.error(`Error scanning libraries: ${error.message}`);
  }
  
  return { components, pages, apiRoutes, libraries };
}

/**
 * Performs semantic analysis to map historical features to current functionality
 * @param {Array<Object>} features - Array of historical features
 * @param {Object} currentState - Current filesystem state
 * @returns {Promise<Object>} - Mapping results
 */
async function performSemanticAnalysis(features, currentState) {
  logger.section('Performing Semantic Analysis');
  
  const results = {
    present: [],
    evolved: [],
    consolidated: [],
    trulyMissing: [],
  };
  
  // Flatten current state for easier searching
  const allCurrentFiles = [
    ...currentState.components,
    ...currentState.pages,
    ...currentState.apiRoutes,
    ...currentState.libraries,
  ];
  
  // Process each historical feature
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    showProgressBar(i + 1, features.length);
    
    // 1. Check for direct matches (PRESENT)
    const directMatches = checkForDirectMatches(feature, allCurrentFiles);
    
    if (directMatches.length > 0) {
      results.present.push({
        ...feature,
        status: FEATURE_STATUS.PRESENT,
        matches: directMatches,
        matchReason: 'Direct match found with same functionality',
      });
      stats.presentFeatures++;
      stats.featuresByCategory[feature.businessCategory].present++;
      continue;
    }
    
    // 2. Check for evolved features (EVOLVED)
    const evolvedMatches = checkForEvolvedFeatures(feature, allCurrentFiles);
    
    if (evolvedMatches.length > 0) {
      results.evolved.push({
        ...feature,
        status: FEATURE_STATUS.EVOLVED,
        matches: evolvedMatches,
        matchReason: 'Similar functionality found in different structure/location',
      });
      stats.evolvedFeatures++;
      stats.featuresByCategory[feature.businessCategory].evolved++;
      continue;
    }
    
    // 3. Check for consolidated features (CONSOLIDATED)
    const consolidatedMatches = checkForConsolidatedFeatures(feature, allCurrentFiles);
    
    if (consolidatedMatches.length > 0) {
      results.consolidated.push({
        ...feature,
        status: FEATURE_STATUS.CONSOLIDATED,
        matches: consolidatedMatches,
        matchReason: 'Functionality merged into larger component',
      });
      stats.consolidatedFeatures++;
      stats.featuresByCategory[feature.businessCategory].consolidated++;
      continue;
    }
    
    // 4. If no matches found, mark as truly missing (TRULY_MISSING)
    results.trulyMissing.push({
      ...feature,
      status: FEATURE_STATUS.TRULY_MISSING,
      matchReason: 'No equivalent functionality found in current codebase',
    });
    stats.trulyMissingFeatures++;
    stats.featuresByCategory[feature.businessCategory].missing++;
  }
  
  logger.success(`Analysis complete: ${results.present.length} present, ${results.evolved.length} evolved, ${results.consolidated.length} consolidated, ${results.trulyMissing.length} truly missing`);
  return results;
}

/**
 * Checks for direct matches between historical feature and current files
 * @param {Object} feature - Historical feature
 * @param {Array<Object>} currentFiles - Current files
 * @returns {Array<Object>} - Array of matching files
 */
function checkForDirectMatches(feature, currentFiles) {
  const matches = [];
  const featureFiles = [...feature.files.added, ...feature.files.modified];
  
  // Check for exact file path matches
  for (const file of featureFiles) {
    const matchingFile = currentFiles.find(currentFile => 
      currentFile.path === file || 
      currentFile.path.endsWith(file)
    );
    
    if (matchingFile) {
      matches.push({
        ...matchingFile,
        matchType: 'exact-path',
        confidence: 1.0,
      });
    }
  }
  
  // Check for exact component name matches (even if path changed)
  for (const file of featureFiles) {
    const basename = path.basename(file, path.extname(file));
    
    const matchingFile = currentFiles.find(currentFile => 
      currentFile.name === basename && 
      !matches.some(match => match.path === currentFile.path)
    );
    
    if (matchingFile) {
      matches.push({
        ...matchingFile,
        matchType: 'exact-name',
        confidence: 0.9,
      });
    }
  }
  
  // Check for keyword matches in file content
  const featureName = feature.name.toLowerCase();
  const keywords = featureName.split(' ').filter(word => word.length > 4);
  
  if (keywords.length > 0) {
    for (const currentFile of currentFiles) {
      if (matches.some(match => match.path === currentFile.path)) continue;
      
      const content = currentFile.content.toLowerCase();
      const matchingKeywords = keywords.filter(keyword => content.includes(keyword));
      
      if (matchingKeywords.length >= Math.ceil(keywords.length * 0.7)) {
        matches.push({
          ...currentFile,
          matchType: 'keyword-content',
          confidence: 0.8 * (matchingKeywords.length / keywords.length),
        });
      }
    }
  }
  
  return matches;
}

/**
 * Checks for evolved features (similar functionality in different structure/location)
 * @param {Object} feature - Historical feature
 * @param {Array<Object>} currentFiles - Current files
 * @returns {Array<Object>} - Array of matching files
 */
function checkForEvolvedFeatures(feature, currentFiles) {
  const matches = [];
  
  // Check for business functionality category matches
  const categoryPatterns = CONFIG.featureMapping[feature.businessCategory + '-system'] || [];
  
  if (categoryPatterns.length > 0) {
    for (const pattern of categoryPatterns) {
      const matchingFiles = currentFiles.filter(file => 
        file.path.includes(pattern) && 
        !matches.some(match => match.path === file.path)
      );
      
      matchingFiles.forEach(file => {
        matches.push({
          ...file,
          matchType: 'business-category',
          confidence: 0.7,
        });
      });
    }
  }
  
  // Check for semantic similarity in file content
  const featureName = feature.name.toLowerCase();
  const keywords = featureName.split(' ')
    .filter(word => word.length > 4)
    .filter(word => !['implement', 'complete', 'enhanced', 'system', 'feature'].includes(word));
  
  if (keywords.length > 0) {
    for (const currentFile of currentFiles) {
      if (matches.some(match => match.path === currentFile.path)) continue;
      
      const content = currentFile.content.toLowerCase();
      const matchingKeywords = keywords.filter(keyword => content.includes(keyword));
      
      if (matchingKeywords.length >= Math.ceil(keywords.length * 0.5)) {
        matches.push({
          ...currentFile,
          matchType: 'semantic-similarity',
          confidence: 0.6 * (matchingKeywords.length / keywords.length),
        });
      }
    }
  }
  
  return matches;
}

/**
 * Checks for consolidated features (functionality merged into larger component)
 * @param {Object} feature - Historical feature
 * @param {Array<Object>} currentFiles - Current files
 * @returns {Array<Object>} - Array of matching files
 */
function checkForConsolidatedFeatures(feature, currentFiles) {
  const matches = [];
  
  // Check for larger components that might contain the feature functionality
  const largeComponents = currentFiles.filter(file => file.size > 500);
  
  // Extract key functionality terms from feature name
  const featureName = feature.name.toLowerCase();
  const functionalityTerms = featureName.split(' ')
    .filter(word => word.length > 4)
    .filter(word => !['implement', 'complete', 'enhanced', 'system', 'feature'].includes(word));
  
  if (functionalityTerms.length > 0) {
    for (const component of largeComponents) {
      if (matches.some(match => match.path === component.path)) continue;
      
      const content = component.content.toLowerCase();
      const matchingTerms = functionalityTerms.filter(term => content.includes(term));
      
      // Check if at least 30% of functionality terms are found in the large component
      if (matchingTerms.length >= Math.ceil(functionalityTerms.length * 0.3)) {
        matches.push({
          ...component,
          matchType: 'consolidated-functionality',
          confidence: 0.5 * (matchingTerms.length / functionalityTerms.length),
        });
      }
    }
  }
  
  return matches;
}

/**
 * Generates recommendations for truly missing features
 * @param {Array<Object>} trulyMissingFeatures - Array of truly missing features
 * @returns {Array<Object>} - Array of recommendations
 */
function generateRecommendations(trulyMissingFeatures) {
  logger.info('Generating recommendations for truly missing features...');
  
  const recommendations = [];
  
  // Group missing features by business category
  const featuresByCategory = {};
  
  trulyMissingFeatures.forEach(feature => {
    if (!featuresByCategory[feature.businessCategory]) {
      featuresByCategory[feature.businessCategory] = [];
    }
    featuresByCategory[feature.businessCategory].push(feature);
  });
  
  // Generate recommendations for each category
  Object.entries(featuresByCategory).forEach(([category, features]) => {
    // Sort features by date (newest first)
    features.sort((a, b) => b.date - a.date);
    
    const recommendation = {
      category,
      featureCount: features.length,
      criticalFeatures: features.slice(0, 3), // Top 3 most recent
      recommendedAction: features.length > 5 ? 'high' : features.length > 2 ? 'medium' : 'low',
      implementationSuggestions: generateImplementationSuggestions(category, features),
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
 * Generates implementation suggestions for missing features
 * @param {string} category - Business functionality category
 * @param {Array<Object>} features - Array of features
 * @returns {string} - Implementation suggestions
 */
function generateImplementationSuggestions(category, features) {
  let suggestions = '';
  
  switch (category) {
    case 'payment':
      suggestions = `
1. Implement Stripe integration with Next.js API routes
2. Create payment confirmation and success pages
3. Add subscription management components
4. Implement invoice generation and tracking
5. Add secure payment processing with proper error handling`;
      break;
    case 'authentication':
      suggestions = `
1. Implement NextAuth.js or Supabase Auth
2. Create login, signup, and profile pages
3. Add role-based access control
4. Implement secure session management
5. Add password reset functionality`;
      break;
    case 'dashboard':
      suggestions = `
1. Create comprehensive dashboard layout
2. Implement data visualization components
3. Add real-time updates and notifications
4. Create user activity tracking
5. Implement customizable dashboard widgets`;
      break;
    case 'ai':
      suggestions = `
1. Integrate OpenAI or Anthropic APIs
2. Implement AI-powered content generation
3. Add intelligent data analysis features
4. Create AI-assisted workflow automation
5. Implement predictive analytics`;
      break;
    case 'video':
      suggestions = `
1. Implement video recording and playback
2. Add video transcoding and processing
3. Create video annotation and commenting system
4. Implement real-time video collaboration
5. Add AI-powered video analysis`;
      break;
    case 'collaboration':
      suggestions = `
1. Implement real-time collaboration with WebSockets
2. Create commenting and feedback system
3. Add presence indicators and user activity
4. Implement document sharing and versioning
5. Create team management features`;
      break;
    case 'file-management':
      suggestions = `
1. Implement secure file uploads and downloads
2. Create file organization and tagging system
3. Add file preview and thumbnail generation
4. Implement file sharing and permissions
5. Create version control and file history`;
      break;
    case 'analytics':
      suggestions = `
1. Implement data collection and processing
2. Create visualization components and charts
3. Add reporting and export functionality
4. Implement real-time analytics dashboard
5. Create user behavior tracking`;
      break;
    default:
      suggestions = `
1. Analyze specific requirements for this category
2. Identify core functionality needed
3. Research best practices and libraries
4. Implement with proper error handling and testing
5. Document usage and integration points`;
  }
  
  return suggestions;
}

/**
 * Generates a comprehensive feature mapping report
 * @param {Object} mappingResults - Feature mapping results
 * @param {Object} currentState - Current filesystem state
 * @param {Array<Object>} recommendations - Recommendations for missing features
 * @returns {Promise<void>}
 */
async function generateReport(mappingResults, currentState, recommendations) {
  logger.section('Generating Comprehensive Feature Mapping Report');
  
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
    '# Intelligent Feature Mapping Report',
    '',
    `**Date:** ${new Date().toISOString().split('T')[0]}`,
    `**Duration:** ${duration.toFixed(2)} seconds`,
    '',
    '## 1. Executive Summary',
    '',
    'This report presents an intelligent semantic analysis of historical features mapped to current functionality in the KAZI platform. Unlike simple file path matching, this analysis looks for functional equivalents, consolidated features, and evolved implementations.',
    '',
    '### Key Findings',
    '',
    `- **Total Features Analyzed:** ${stats.featuresIdentified}`,
    `- **Present Features:** ${stats.presentFeatures} (${Math.round(stats.presentFeatures / stats.featuresIdentified * 100)}%)`,
    `- **Evolved Features:** ${stats.evolvedFeatures} (${Math.round(stats.evolvedFeatures / stats.featuresIdentified * 100)}%)`,
    `- **Consolidated Features:** ${stats.consolidatedFeatures} (${Math.round(stats.consolidatedFeatures / stats.featuresIdentified * 100)}%)`,
    `- **Truly Missing Features:** ${stats.trulyMissingFeatures} (${Math.round(stats.trulyMissingFeatures / stats.featuresIdentified * 100)}%)`,
    '',
    '### Current Application State',
    '',
    `- **Components:** ${currentState.components.length}`,
    `- **Pages:** ${currentState.pages.length}`,
    `- **API Routes:** ${currentState.apiRoutes.length}`,
    `- **Libraries:** ${currentState.libraries.length}`,
    '',
    '## 2. Business Functionality Analysis',
    '',
    '| Category | Total Features | Present | Evolved | Consolidated | Truly Missing |',
    '|----------|----------------|---------|---------|--------------|---------------|',
  ];
  
  // Add business functionality categories
  Object.entries(stats.featuresByCategory).forEach(([category, counts]) => {
    if (counts.total > 0) {
      report.push(`| ${category} | ${counts.total} | ${counts.present} | ${counts.evolved} | ${counts.consolidated} | ${counts.missing} |`);
    }
  });
  
  report.push(
    '',
    '## 3. Present Features',
    '',
    'The following features are present in their original form:',
    '',
  );
  
  // Add present features
  if (mappingResults.present.length === 0) {
    report.push('No features found in their original form.');
  } else {
    mappingResults.present.forEach(feature => {
      report.push(`### ${feature.name}`);
      report.push('');
      report.push(`- **Category:** ${feature.businessCategory}`);
      report.push(`- **Date:** ${feature.date.toISOString().split('T')[0]}`);
      report.push(`- **Match Reason:** ${feature.matchReason}`);
      report.push('');
      report.push('**Matching Files:**');
      report.push('');
      
      feature.matches.slice(0, 5).forEach(match => {
        report.push(`- ${match.path} (${Math.round(match.confidence * 100)}% confidence, ${match.matchType})`);
      });
      
      if (feature.matches.length > 5) {
        report.push(`- ... and ${feature.matches.length - 5} more files`);
      }
      
      report.push('');
    });
  }
  
  report.push(
    '## 4. Evolved Features',
    '',
    'The following features exist but have evolved into different structures or locations:',
    '',
  );
  
  // Add evolved features
  if (mappingResults.evolved.length === 0) {
    report.push('No evolved features found.');
  } else {
    mappingResults.evolved.forEach(feature => {
      report.push(`### ${feature.name}`);
      report.push('');
      report.push(`- **Category:** ${feature.businessCategory}`);
      report.push(`- **Date:** ${feature.date.toISOString().split('T')[0]}`);
      report.push(`- **Match Reason:** ${feature.matchReason}`);
      report.push('');
      report.push('**Matching Files:**');
      report.push('');
      
      feature.matches.slice(0, 5).forEach(match => {
        report.push(`- ${match.path} (${Math.round(match.confidence * 100)}% confidence, ${match.matchType})`);
      });
      
      if (feature.matches.length > 5) {
        report.push(`- ... and ${feature.matches.length - 5} more files`);
      }
      
      report.push('');
    });
  }
  
  report.push(
    '## 5. Consolidated Features',
    '',
    'The following features have been merged into larger components:',
    '',
  );
  
  // Add consolidated features
  if (mappingResults.consolidated.length === 0) {
    report.push('No consolidated features found.');
  } else {
    mappingResults.consolidated.forEach(feature => {
      report.push(`### ${feature.name}`);
      report.push('');
      report.push(`- **Category:** ${feature.businessCategory}`);
      report.push(`- **Date:** ${feature.date.toISOString().split('T')[0]}`);
      report.push(`- **Match Reason:** ${feature.matchReason}`);
      report.push('');
      report.push('**Containing Components:**');
      report.push('');
      
      feature.matches.slice(0, 5).forEach(match => {
        report.push(`- ${match.path} (${Math.round(match.confidence * 100)}% confidence, ${match.matchType})`);
      });
      
      if (feature.matches.length > 5) {
        report.push(`- ... and ${feature.matches.length - 5} more files`);
      }
      
      report.push('');
    });
  }
  
  report.push(
    '## 6. Truly Missing Features',
    '',
    'The following features are genuinely missing from the current application:',
    '',
  );
  
  // Add truly missing features
  if (mappingResults.trulyMissing.length === 0) {
    report.push('No truly missing features found. All historical features are present in some form.');
  } else {
    mappingResults.trulyMissing.forEach(feature => {
      report.push(`### ${feature.name}`);
      report.push('');
      report.push(`- **Category:** ${feature.businessCategory}`);
      report.push(`- **Date:** ${feature.date.toISOString().split('T')[0]}`);
      report.push(`- **Match Reason:** ${feature.matchReason}`);
      report.push('');
    });
  }
  
  report.push(
    '## 7. Recommendations',
    '',
    'Based on the analysis, the following recommendations are provided for restoring missing functionality:',
    '',
  );
  
  // Add recommendations
  if (recommendations.length === 0) {
    report.push('No recommendations needed. All historical features are present in some form.');
  } else {
    recommendations.forEach(recommendation => {
      report.push(`### ${recommendation.category} (${recommendation.recommendedAction.toUpperCase()} Priority)`);
      report.push('');
      report.push(`- **Missing Features:** ${recommendation.featureCount}`);
      report.push('');
      report.push('**Critical Features to Restore:**');
      report.push('');
      
      recommendation.criticalFeatures.forEach(feature => {
        report.push(`- ${feature.name} (${feature.date.toISOString().split('T')[0]})`);
      });
      
      report.push('');
      report.push('**Implementation Suggestions:**');
      report.push(recommendation.implementationSuggestions);
      report.push('');
    });
  }
  
  report.push(
    '## 8. Detailed Component Inventory',
    '',
    '### Top Components by Size',
    '',
    '| Component | Category | Size (Lines) |',
    '|-----------|----------|--------------|',
  );
  
  // Add top 20 components by size
  currentState.components
    .sort((a, b) => b.size - a.size)
    .slice(0, 20)
    .forEach(component => {
      report.push(`| ${component.name} | ${component.businessCategory} | ${component.size} |`);
    });
  
  report.push(
    '',
    '### Key API Routes',
    '',
    '| Route | Category | Methods |',
    '|-------|----------|---------|',
  );
  
  // Add key API routes
  currentState.apiRoutes
    .filter(route => ['payment', 'authentication', 'ai', 'video', 'collaboration'].includes(route.businessCategory))
    .sort((a, b) => a.route.localeCompare(b.route))
    .forEach(route => {
      report.push(`| ${route.route} | ${route.businessCategory} | ${route.methods.join(', ')} |`);
    });
  
  report.push(
    '',
    '## 9. Conclusion',
    '',
  );
  
  const presentAndEvolved = stats.presentFeatures + stats.evolvedFeatures + stats.consolidatedFeatures;
  const presentPercent = Math.round((presentAndEvolved / stats.featuresIdentified) * 100);
  
  if (stats.trulyMissingFeatures === 0) {
    report.push('The KAZI platform has successfully maintained all historical features, though many have evolved or been consolidated into more efficient implementations. The application is in excellent condition with no missing functionality.');
  } else if (stats.trulyMissingFeatures < 5) {
    report.push(`The KAZI platform has maintained most of its historical features (${presentPercent}%), with only ${stats.trulyMissingFeatures} truly missing features. These can be restored following the recommendations in this report to achieve 100% feature preservation.`);
  } else {
    report.push(`The KAZI platform contains ${presentPercent}% of its historical features in some form (present, evolved, or consolidated), but is missing ${stats.trulyMissingFeatures} features. A targeted restoration effort is recommended, prioritizing the high-priority categories identified in this report.`);
  }
  
  report.push(
    '',
    '---',
    '',
    `Generated by intelligent-feature-mapping-audit.js on ${new Date().toISOString()}`,
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
    mappingResults,
    currentState: {
      components: currentState.components.map(c => ({
        path: c.path,
        name: c.name,
        businessCategory: c.businessCategory,
        size: c.size,
      })),
      pages: currentState.pages.map(p => ({
        path: p.path,
        route: p.route,
        businessCategory: p.businessCategory,
        size: p.size,
      })),
      apiRoutes: currentState.apiRoutes.map(a => ({
        path: a.path,
        route: a.route,
        businessCategory: a.businessCategory,
        methods: a.methods,
        size: a.size,
      })),
      libraries: currentState.libraries.map(l => ({
        path: l.path,
        name: l.name,
        businessCategory: l.businessCategory,
        size: l.size,
      })),
    },
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
}

/**
 * Main function to run the feature mapping audit
 */
async function main() {
  try {
    logger.section('Starting Intelligent Feature Mapping Audit');
    
    // Create output directory if it doesn't exist
    await mkdir(CONFIG.outputDir, { recursive: true });
    
    // Step 1: Get all commits from Git history
    const commits = getAllCommits();
    stats.commitsAnalyzed = commits.length;
    
    // Step 2: Extract features from commit messages
    const features = extractFeaturesFromCommits(commits);
    
    // Step 3: Scan current filesystem
    const currentState = await scanCurrentFilesystem();
    
    // Step 4: Perform semantic analysis to map historical features to current functionality
    const mappingResults = await performSemanticAnalysis(features, currentState);
    
    // Step 5: Generate recommendations for truly missing features
    const recommendations = generateRecommendations(mappingResults.trulyMissing);
    
    // Step 6: Generate comprehensive report
    stats.endTime = Date.now();
    await generateReport(mappingResults, currentState, recommendations);
    
    logger.section('Feature Mapping Audit Complete');
    logger.info(`Commits analyzed: ${stats.commitsAnalyzed}`);
    logger.info(`Features identified: ${stats.featuresIdentified}`);
    logger.info(`Components analyzed: ${stats.componentsAnalyzed}`);
    logger.info(`Pages analyzed: ${stats.pagesAnalyzed}`);
    logger.info(`API routes analyzed: ${stats.apiRoutesAnalyzed}`);
    logger.info(`Present features: ${stats.presentFeatures}`);
    logger.info(`Evolved features: ${stats.evolvedFeatures}`);
    logger.info(`Consolidated features: ${stats.consolidatedFeatures}`);
    logger.info(`Truly missing features: ${stats.trulyMissingFeatures}`);
    
    const presentAndEvolved = stats.presentFeatures + stats.evolvedFeatures + stats.consolidatedFeatures;
    const presentPercent = Math.round((presentAndEvolved / stats.featuresIdentified) * 100);
    
    logger.success(`${presentPercent}% of historical features are present in some form!`);
    
    if (stats.trulyMissingFeatures === 0) {
      logger.success('All historical features are present in some form in the current application!');
    } else {
      logger.warn(`${stats.trulyMissingFeatures} historical features are truly missing. See the report for details.`);
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
