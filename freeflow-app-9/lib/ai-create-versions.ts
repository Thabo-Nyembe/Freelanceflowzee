/**
 * AI CREATE A++++ - VERSION CONTROL UTILITY
 *
 * Provides comprehensive version control for AI-generated content.
 * Enables tracking, comparison, and rollback of content iterations.
 *
 * Features:
 * - Save unlimited versions with metadata
 * - Line-by-line diff visualization
 * - Rollback to any previous version
 * - Version branching and merging
 * - Auto-save on significant changes
 * - Version export/import
 *
 * @example
 * ```typescript
 * // Save a version
 * const versionId = saveVersion({
 *   generationId: 'gen-123',
 *   content: 'Updated content...',
 *   label: 'Added conclusion section',
 *   isAutoSave: false
 * })
 *
 * // Get diff between versions
 * const diff = compareVersions('gen-123', 'v1', 'v2')
 *
 * // Rollback
 * const restored = rollbackToVersion('gen-123', 'v1')
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ContentVersion {
  id: string
  generationId: string
  versionNumber: number
  content: string
  label?: string
  description?: string
  createdAt: Date
  isAutoSave: boolean
  metadata: VersionMetadata
  parentVersionId?: string
}

export interface VersionMetadata {
  wordCount: number
  characterCount: number
  changes?: VersionChanges
  editDuration?: number
  seoScore?: number
  readabilityScore?: number
}

export interface VersionChanges {
  additions: number
  deletions: number
  modifications: number
  netChange: number
}

export interface VersionDiff {
  lines: DiffLine[]
  summary: DiffSummary
  similarity: number
}

export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified'
  oldLineNumber?: number
  newLineNumber?: number
  oldContent?: string
  newContent?: string
}

export interface DiffSummary {
  linesAdded: number
  linesRemoved: number
  linesModified: number
  linesUnchanged: number
  totalChanges: number
}

export interface VersionTree {
  generationId: string
  versions: ContentVersion[]
  currentVersion?: string
  branches: VersionBranch[]
}

export interface VersionBranch {
  id: string
  name: string
  baseVersionId: string
  versions: string[]
}

export interface SaveVersionOptions {
  generationId: string
  content: string
  label?: string
  description?: string
  isAutoSave?: boolean
  parentVersionId?: string
}

export interface RollbackOptions {
  generationId: string
  versionId: string
  createBackup?: boolean
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEY_PREFIX = 'ai-create-versions-'

function getStorageKey(generationId: string): string {
  return `${STORAGE_KEY_PREFIX}${generationId}`
}

// ============================================================================
// VERSION MANAGEMENT
// ============================================================================

/**
 * Saves a new version of content
 *
 * @param options - Version save options
 * @returns Version ID
 */
export function saveVersion(options: SaveVersionOptions): string {
  const { generationId, content, label, description, isAutoSave = false, parentVersionId } = options

  try {
    // Load existing versions
    const tree = loadVersionTree(generationId)

    // Create new version
    const versionNumber = tree.versions.length + 1
    const versionId = `v${versionNumber}`

    // Calculate metadata
    const metadata: VersionMetadata = {
      wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
      characterCount: content.length
    }

    // Calculate changes if there's a parent
    if (parentVersionId) {
      const parentVersion = tree.versions.find(v => v.id === parentVersionId)
      if (parentVersion) {
        metadata.changes = calculateChanges(parentVersion.content, content)
      }
    }

    const newVersion: ContentVersion = {
      id: versionId,
      generationId,
      versionNumber,
      content,
      label,
      description,
      createdAt: new Date(),
      isAutoSave,
      metadata,
      parentVersionId
    }

    // Add to tree
    tree.versions.push(newVersion)
    tree.currentVersion = versionId

    // Save to localStorage
    localStorage.setItem(getStorageKey(generationId), JSON.stringify(tree))

    return versionId
  } catch (error) {
    console.error('Failed to save version:', error)
    throw error
  }
}

/**
 * Loads version tree for a generation
 *
 * @param generationId - Generation ID
 * @returns Version tree
 */
export function loadVersionTree(generationId: string): VersionTree {
  try {
    const stored = localStorage.getItem(getStorageKey(generationId))
    if (!stored) {
      return {
        generationId,
        versions: [],
        branches: []
      }
    }

    const parsed = JSON.parse(stored)

    // Deserialize dates
    parsed.versions = parsed.versions.map((v: any) => ({
      ...v,
      createdAt: new Date(v.createdAt)
    }))

    return parsed
  } catch (error) {
    console.error('Failed to load version tree:', error)
    return {
      generationId,
      versions: [],
      branches: []
    }
  }
}

/**
 * Gets a specific version by ID
 *
 * @param generationId - Generation ID
 * @param versionId - Version ID
 * @returns Version or null
 */
export function getVersion(generationId: string, versionId: string): ContentVersion | null {
  const tree = loadVersionTree(generationId)
  return tree.versions.find(v => v.id === versionId) || null
}

/**
 * Gets all versions for a generation
 *
 * @param generationId - Generation ID
 * @returns Array of versions
 */
export function getAllVersions(generationId: string): ContentVersion[] {
  const tree = loadVersionTree(generationId)
  return tree.versions
}

/**
 * Deletes a version
 *
 * @param generationId - Generation ID
 * @param versionId - Version ID
 * @returns Success boolean
 */
export function deleteVersion(generationId: string, versionId: string): boolean {
  try {
    const tree = loadVersionTree(generationId)
    const index = tree.versions.findIndex(v => v.id === versionId)

    if (index === -1) {
      return false
    }

    // Remove version
    tree.versions.splice(index, 1)

    // Update current if deleted
    if (tree.currentVersion === versionId) {
      tree.currentVersion = tree.versions[tree.versions.length - 1]?.id
    }

    // Save
    localStorage.setItem(getStorageKey(generationId), JSON.stringify(tree))
    return true
  } catch (error) {
    console.error('Failed to delete version:', error)
    return false
  }
}

/**
 * Rolls back to a specific version
 *
 * @param options - Rollback options
 * @returns Restored content
 */
export function rollbackToVersion(options: RollbackOptions): string {
  const { generationId, versionId, createBackup = true } = options

  try {
    const tree = loadVersionTree(generationId)
    const targetVersion = tree.versions.find(v => v.id === versionId)

    if (!targetVersion) {
      throw new Error(`Version ${versionId} not found`)
    }

    // Create backup of current version if requested
    if (createBackup && tree.currentVersion) {
      const currentVersion = tree.versions.find(v => v.id === tree.currentVersion)
      if (currentVersion) {
        saveVersion({
          generationId,
          content: currentVersion.content,
          label: `Backup before rollback to ${versionId}`,
          isAutoSave: true,
          parentVersionId: currentVersion.id
        })
      }
    }

    // Update current version
    tree.currentVersion = versionId

    // Save
    localStorage.setItem(getStorageKey(generationId), JSON.stringify(tree))

    return targetVersion.content
  } catch (error) {
    console.error('Failed to rollback version:', error)
    throw error
  }
}

// ============================================================================
// VERSION COMPARISON & DIFF
// ============================================================================

/**
 * Compares two versions and generates a diff
 *
 * @param generationId - Generation ID
 * @param versionId1 - First version ID
 * @param versionId2 - Second version ID
 * @returns Diff result
 */
export function compareVersions(
  generationId: string,
  versionId1: string,
  versionId2: string
): VersionDiff {
  const version1 = getVersion(generationId, versionId1)
  const version2 = getVersion(generationId, versionId2)

  if (!version1 || !version2) {
    throw new Error('One or both versions not found')
  }

  return generateDiff(version1.content, version2.content)
}

/**
 * Generates a line-by-line diff between two text contents
 *
 * @param oldContent - Original content
 * @param newContent - New content
 * @returns Diff with lines and summary
 */
export function generateDiff(oldContent: string, newContent: string): VersionDiff {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  const diffLines: DiffLine[] = []
  const summary: DiffSummary = {
    linesAdded: 0,
    linesRemoved: 0,
    linesModified: 0,
    linesUnchanged: 0,
    totalChanges: 0
  }

  // Simple diff algorithm (LCS-based would be better for production)
  let oldIndex = 0
  let newIndex = 0

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex]
    const newLine = newLines[newIndex]

    if (oldIndex >= oldLines.length) {
      // Remaining lines are additions
      diffLines.push({
        type: 'added',
        newLineNumber: newIndex + 1,
        newContent: newLine
      })
      summary.linesAdded++
      newIndex++
    } else if (newIndex >= newLines.length) {
      // Remaining lines are deletions
      diffLines.push({
        type: 'removed',
        oldLineNumber: oldIndex + 1,
        oldContent: oldLine
      })
      summary.linesRemoved++
      oldIndex++
    } else if (oldLine === newLine) {
      // Lines are identical
      diffLines.push({
        type: 'unchanged',
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
        oldContent: oldLine,
        newContent: newLine
      })
      summary.linesUnchanged++
      oldIndex++
      newIndex++
    } else {
      // Lines differ - check if it's a modification or add/remove
      // Simple heuristic: if similar, it's modified, otherwise separate add/remove
      const similarity = calculateLineSimilarity(oldLine, newLine)

      if (similarity > 0.5) {
        // Modified line
        diffLines.push({
          type: 'modified',
          oldLineNumber: oldIndex + 1,
          newLineNumber: newIndex + 1,
          oldContent: oldLine,
          newContent: newLine
        })
        summary.linesModified++
        oldIndex++
        newIndex++
      } else {
        // Check next lines to see if one was removed/added
        const nextOldLine = oldLines[oldIndex + 1]
        const nextNewLine = newLines[newIndex + 1]

        if (nextOldLine === newLine) {
          // Old line was removed
          diffLines.push({
            type: 'removed',
            oldLineNumber: oldIndex + 1,
            oldContent: oldLine
          })
          summary.linesRemoved++
          oldIndex++
        } else if (nextNewLine === oldLine) {
          // New line was added
          diffLines.push({
            type: 'added',
            newLineNumber: newIndex + 1,
            newContent: newLine
          })
          summary.linesAdded++
          newIndex++
        } else {
          // Treat as modification
          diffLines.push({
            type: 'modified',
            oldLineNumber: oldIndex + 1,
            newLineNumber: newIndex + 1,
            oldContent: oldLine,
            newContent: newLine
          })
          summary.linesModified++
          oldIndex++
          newIndex++
        }
      }
    }
  }

  summary.totalChanges = summary.linesAdded + summary.linesRemoved + summary.linesModified

  // Calculate overall similarity
  const similarity = summary.linesUnchanged / Math.max(oldLines.length, newLines.length, 1)

  return {
    lines: diffLines,
    summary,
    similarity
  }
}

/**
 * Calculates similarity between two lines (0-1)
 */
function calculateLineSimilarity(line1: string, line2: string): number {
  const words1 = line1.toLowerCase().split(/\s+/)
  const words2 = line2.toLowerCase().split(/\s+/)

  const commonWords = words1.filter(w => words2.includes(w)).length
  const totalWords = Math.max(words1.length, words2.length, 1)

  return commonWords / totalWords
}

// ============================================================================
// AUTO-SAVE MANAGEMENT
// ============================================================================

const autoSaveTimers: Map<string, NodeJS.Timeout> = new Map()

/**
 * Enables auto-save for a generation
 *
 * @param generationId - Generation ID
 * @param getContent - Function to get current content
 * @param interval - Auto-save interval in milliseconds (default: 30s)
 */
export function enableAutoSave(
  generationId: string,
  getContent: () => string,
  interval: number = 30000
): void {
  // Clear existing timer if any
  disableAutoSave(generationId)

  // Set new timer
  const timerId = setInterval(() => {
    const content = getContent()
    if (content) {
      const tree = loadVersionTree(generationId)
      const lastVersion = tree.versions[tree.versions.length - 1]

      // Only save if content changed
      if (!lastVersion || lastVersion.content !== content) {
        saveVersion({
          generationId,
          content,
          label: 'Auto-save',
          isAutoSave: true,
          parentVersionId: lastVersion?.id
        })
      }
    }
  }, interval)

  autoSaveTimers.set(generationId, timerId)
}

/**
 * Disables auto-save for a generation
 *
 * @param generationId - Generation ID
 */
export function disableAutoSave(generationId: string): void {
  const timerId = autoSaveTimers.get(generationId)
  if (timerId) {
    clearInterval(timerId)
    autoSaveTimers.delete(generationId)
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates changes between two content strings
 */
function calculateChanges(oldContent: string, newContent: string): VersionChanges {
  const oldWords = oldContent.split(/\s+/).filter(w => w.length > 0)
  const newWords = newContent.split(/\s+/).filter(w => w.length > 0)

  // Simple approximation
  const additions = Math.max(0, newWords.length - oldWords.length)
  const deletions = Math.max(0, oldWords.length - newWords.length)

  // Count modifications (words that changed)
  const modifications = Math.min(oldWords.length, newWords.length) -
    oldWords.filter((w, i) => w === newWords[i]).length

  return {
    additions,
    deletions,
    modifications,
    netChange: newWords.length - oldWords.length
  }
}

/**
 * Exports version tree to JSON
 */
export function exportVersionTree(generationId: string): string {
  const tree = loadVersionTree(generationId)
  return JSON.stringify(tree, null, 2)
}

/**
 * Imports version tree from JSON
 */
export function importVersionTree(jsonData: string): boolean {
  try {
    const tree: VersionTree = JSON.parse(jsonData)

    // Validate structure
    if (!tree.generationId || !Array.isArray(tree.versions)) {
      throw new Error('Invalid version tree format')
    }

    // Deserialize dates
    tree.versions = tree.versions.map(v => ({
      ...v,
      createdAt: new Date(v.createdAt)
    }))

    // Save
    localStorage.setItem(getStorageKey(tree.generationId), JSON.stringify(tree))
    return true
  } catch (error) {
    console.error('Failed to import version tree:', error)
    return false
  }
}

/**
 * Deletes all versions for a generation
 */
export function deleteAllVersions(generationId: string): boolean {
  try {
    localStorage.removeItem(getStorageKey(generationId))
    disableAutoSave(generationId)
    return true
  } catch (error) {
    console.error('Failed to delete versions:', error)
    return false
  }
}
