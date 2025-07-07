#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const chalk = require('chalk')

// Configuration
const config = {
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx'],
  excludeDirs: ['node_modules', '.next', 'dist', '.git', 'public'],
  headerTypes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  maxHeaderLength: 100,
  minHeaderLength: 3,
}

// Logging utilities
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✖'), msg),
}

// Helper function to generate a unique suffix
function generateUniqueSuffix() {
  return Math.random().toString(36).substring(7)
}

// Helper function to check if a header is valid
function isValidHeader(text) {
  return text.length >= config.minHeaderLength &&
    text.length <= config.maxHeaderLength &&
    !/[<>]/.test(text) // No HTML tags in headers
}

// Helper function to normalize header text
function normalizeHeaderText(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters
}

// Helper function to find and analyze headers in a file
function analyzeHeaders(content) {
  const headers = new Map()
  const issues = []
  
  config.headerTypes.forEach(type => {
    const regex = new RegExp(`<${type}[^>]*>([^<]+)<\/${type}>`, 'g')
    let match
    
    while ((match = regex.exec(content)) !== null) {
      const headerText = match[1].trim()
      const normalizedText = normalizeHeaderText(headerText)
      
      if (!isValidHeader(headerText)) {
        issues.push({
          type: 'invalid',
          header: headerText,
          position: match.index,
        })
        continue
      }
      
      if (headers.has(normalizedText)) {
        issues.push({
          type: 'duplicate',
          header: headerText,
          position: match.index,
          originalPosition: headers.get(normalizedText),
        })
      } else {
        headers.set(normalizedText, match.index)
      }
    }
  })
  
  return { headers, issues }
}

// Helper function to fix header issues
function fixHeaderIssues(content, issues) {
  let fixedContent = content
  const changes = []
  
  issues.forEach(issue => {
    if (issue.type === 'duplicate') {
      const newText = `${issue.header} (${generateUniqueSuffix()})`
      const regex = new RegExp(`(${issue.header})(?=<\\/h[1-6]>)`)
      fixedContent = fixedContent.replace(regex, newText)
      changes.push({
        type: 'duplicate_fixed',
        original: issue.header,
        new: newText,
      })
    } else if (issue.type === 'invalid') {
      const fixedText = normalizeHeaderText(issue.header)
      if (isValidHeader(fixedText)) {
        const regex = new RegExp(`(${issue.header})(?=<\\/h[1-6]>)`)
        fixedContent = fixedContent.replace(regex, fixedText)
        changes.push({
          type: 'invalid_fixed',
          original: issue.header,
          new: fixedText,
        })
      }
    }
  })
  
  return { fixedContent, changes }
}

// Main function to process a file
function processFile(filePath) {
  log.info(`Processing ${filePath}...`)
  
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const { issues } = analyzeHeaders(content)
    
    if (issues.length === 0) {
      log.success(`No issues found in ${filePath}`)
      return
    }
    
    const { fixedContent, changes } = fixHeaderIssues(content, issues)
    
    if (changes.length > 0) {
      fs.writeFileSync(filePath, fixedContent, 'utf8')
      changes.forEach(change => {
        if (change.type === 'duplicate_fixed') {
          log.success(`Fixed duplicate header: "${change.original}" → "${change.new}"`)
        } else if (change.type === 'invalid_fixed') {
          log.success(`Fixed invalid header: "${change.original}" → "${change.new}"`)
        }
      })
    }
  } catch (error) {
    log.error(`Error processing ${filePath}: ${error.message}`)
  }
}

// Find and process all files
function processAllFiles() {
  const files = glob.sync('**/*.*', {
    ignore: config.excludeDirs.map(dir => `**/${dir}/**`),
  })
  
  const eligibleFiles = files.filter(file => {
    const ext = path.extname(file)
    return config.extensions.includes(ext)
  })
  
  log.info(`Found ${eligibleFiles.length} files to process`)
  eligibleFiles.forEach(processFile)
}

// Execute
log.info('Starting duplicate headers fix automation...')
processAllFiles()
log.success('Duplicate headers fix automation complete!') 