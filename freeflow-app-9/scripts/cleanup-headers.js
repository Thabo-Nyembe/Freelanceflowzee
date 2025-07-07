#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Configuration
const config = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludeDirs: ['node_modules', '.next', 'dist', '.git'],
  headerTypes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
}

// Helper function to check if a file should be processed
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath)
  return config.extensions.includes(ext) &&
    !config.excludeDirs.some(dir => filePath.includes(dir))
}

// Helper function to find duplicate headers
function findDuplicateHeaders(content) {
  const headers = {}
  const duplicates = []
  
  config.headerTypes.forEach(type => {
    const regex = new RegExp(`<${type}[^>]*>([^<]+)<\/${type}>`, 'g')
    let match
    
    while ((match = regex.exec(content)) !== null) {
      const headerText = match[1].trim()
      if (headers[headerText]) {
        duplicates.push({
          type,
          text: headerText,
          index: match.index,
        })
      } else {
        headers[headerText] = true
      }
    }
  })
  
  return duplicates
}

// Helper function to fix header hierarchy
function fixHeaderHierarchy(content) {
  let currentLevel = 1
  let fixedContent = content
  
  // First pass: collect all headers and their levels
  const headers = []
  config.headerTypes.forEach(type => {
    const regex = new RegExp(`<${type}[^>]*>([^<]+)<\/${type}>`, 'g')
    let match
    while ((match = regex.exec(content)) !== null) {
      headers.push({
        type,
        text: match[1],
        index: match.index,
        level: parseInt(type.substring(1)),
      })
    }
  })
  
  // Sort headers by their position in the document
  headers.sort((a, b) => a.index - b.index)
  
  // Second pass: fix hierarchy
  let lastLevel = 1
  headers.forEach(header => {
    if (header.level - lastLevel > 1) {
      // Fix skipped level
      const newType = `h${lastLevel + 1}`
      fixedContent = fixedContent.replace(
        `<${header.type}`,
        `<${newType}`
      ).replace(
        `</${header.type}>`,
        `</${newType}>`
      )
    }
    lastLevel = header.level
  })
  
  return fixedContent
}

// Main cleanup function
function cleanupHeaders(filePath) {
  console.log(`Processing ${filePath}...`)
  
  const content = fs.readFileSync(filePath, 'utf8')
  let fixedContent = content
  
  // Find and fix duplicate headers
  const duplicates = findDuplicateHeaders(content)
  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate headers in ${filePath}`)
    duplicates.forEach(dup => {
      const newText = `${dup.text} (${Math.random().toString(36).substring(7)})`
      fixedContent = fixedContent.replace(
        `<${dup.type}>${dup.text}</${dup.type}>`,
        `<${dup.type}>${newText}</${dup.type}>`
      )
    })
  }
  
  // Fix header hierarchy
  fixedContent = fixHeaderHierarchy(fixedContent)
  
  // Write changes if content was modified
  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent, 'utf8')
    console.log(`Fixed headers in ${filePath}`)
  }
}

// Find and process all files
function processAllFiles() {
  const files = glob.sync('**/*.*', {
    ignore: config.excludeDirs.map(dir => `**/${dir}/**`),
  })
  
  files
    .filter(shouldProcessFile)
    .forEach(cleanupHeaders)
}

// Execute
console.log('Starting header cleanup...')
processAllFiles()
console.log('Header cleanup complete!') 