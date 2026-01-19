/**
 * Conflict Resolver for Collaborative Editing
 *
 * Handles merge conflicts, operational transformation,
 * and conflict resolution strategies for real-time collaboration.
 */

import * as Y from 'yjs'

// Types
export type ConflictStrategy = 'last-write-wins' | 'first-write-wins' | 'merge' | 'manual' | 'custom'

export interface ConflictInfo {
  id: string
  type: 'text' | 'object' | 'array' | 'attribute'
  path: string[]
  localValue: any
  remoteValue: any
  localTimestamp: number
  remoteTimestamp: number
  localUser: string
  remoteUser: string
  resolved: boolean
  resolution?: any
}

export interface MergeResult<T = any> {
  success: boolean
  result: T
  conflicts: ConflictInfo[]
  hasConflicts: boolean
}

export interface ConflictResolutionOptions {
  strategy: ConflictStrategy
  customResolver?: (conflict: ConflictInfo) => any
  preserveHistory?: boolean
  autoResolve?: boolean
}

/**
 * ConflictResolver class
 */
export class ConflictResolver {
  private strategy: ConflictStrategy
  private customResolver?: (conflict: ConflictInfo) => any
  private conflicts: Map<string, ConflictInfo> = new Map()
  private listeners: Set<(conflicts: ConflictInfo[]) => void> = new Set()

  constructor(options: Partial<ConflictResolutionOptions> = {}) {
    this.strategy = options.strategy || 'merge'
    this.customResolver = options.customResolver
  }

  /**
   * Detect conflicts between local and remote changes
   */
  detectConflicts(
    localDoc: any,
    remoteDoc: any,
    localMeta: { timestamp: number; userId: string },
    remoteMeta: { timestamp: number; userId: string }
  ): ConflictInfo[] {
    const conflicts: ConflictInfo[] = []
    this.compareObjects(localDoc, remoteDoc, [], conflicts, localMeta, remoteMeta)
    return conflicts
  }

  /**
   * Resolve a single conflict
   */
  resolveConflict(conflict: ConflictInfo): any {
    switch (this.strategy) {
      case 'last-write-wins':
        return conflict.localTimestamp > conflict.remoteTimestamp
          ? conflict.localValue
          : conflict.remoteValue

      case 'first-write-wins':
        return conflict.localTimestamp < conflict.remoteTimestamp
          ? conflict.localValue
          : conflict.remoteValue

      case 'merge':
        return this.mergeValues(conflict)

      case 'custom':
        if (this.customResolver) {
          return this.customResolver(conflict)
        }
        // Fall back to merge
        return this.mergeValues(conflict)

      case 'manual':
      default:
        // Mark as unresolved - needs user intervention
        conflict.resolved = false
        this.conflicts.set(conflict.id, conflict)
        this.notifyListeners()
        return undefined
    }
  }

  /**
   * Merge two documents with conflict resolution
   */
  mergeDocuments<T>(
    local: T,
    remote: T,
    localMeta: { timestamp: number; userId: string },
    remoteMeta: { timestamp: number; userId: string }
  ): MergeResult<T> {
    const conflicts = this.detectConflicts(local, remote, localMeta, remoteMeta)
    const result = this.deepClone(local) as T

    const unresolvedConflicts: ConflictInfo[] = []

    for (const conflict of conflicts) {
      const resolved = this.resolveConflict(conflict)

      if (resolved !== undefined) {
        this.setNestedValue(result, conflict.path, resolved)
        conflict.resolved = true
        conflict.resolution = resolved
      } else {
        unresolvedConflicts.push(conflict)
      }
    }

    return {
      success: unresolvedConflicts.length === 0,
      result,
      conflicts,
      hasConflicts: unresolvedConflicts.length > 0
    }
  }

  /**
   * Merge Yjs documents
   */
  mergeYjsDocuments(local: Y.Doc, remote: Y.Doc): Y.Doc {
    const merged = new Y.Doc()

    // Apply local state first
    const localState = Y.encodeStateAsUpdate(local)
    Y.applyUpdate(merged, localState)

    // Then apply remote state - Yjs will handle CRDT merge
    const remoteState = Y.encodeStateAsUpdate(remote)
    Y.applyUpdate(merged, remoteState)

    return merged
  }

  /**
   * Resolve conflict with user choice
   */
  manualResolve(conflictId: string, choice: 'local' | 'remote' | 'custom', customValue?: any) {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) return null

    let resolution: any

    switch (choice) {
      case 'local':
        resolution = conflict.localValue
        break
      case 'remote':
        resolution = conflict.remoteValue
        break
      case 'custom':
        resolution = customValue
        break
    }

    conflict.resolved = true
    conflict.resolution = resolution
    this.conflicts.delete(conflictId)
    this.notifyListeners()

    return resolution
  }

  /**
   * Get pending conflicts
   */
  getPendingConflicts(): ConflictInfo[] {
    return Array.from(this.conflicts.values()).filter(c => !c.resolved)
  }

  /**
   * Subscribe to conflict changes
   */
  onConflictChange(callback: (conflicts: ConflictInfo[]) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Clear all conflicts
   */
  clearConflicts() {
    this.conflicts.clear()
    this.notifyListeners()
  }

  /**
   * Three-way merge for text
   */
  threeWayMerge(base: string, local: string, remote: string): { result: string; hasConflict: boolean } {
    // Simple implementation - in production use a proper diff-match-patch library
    const baseLines = base.split('\n')
    const localLines = local.split('\n')
    const remoteLines = remote.split('\n')

    const result: string[] = []
    let hasConflict = false

    const maxLength = Math.max(baseLines.length, localLines.length, remoteLines.length)

    for (let i = 0; i < maxLength; i++) {
      const baseLine = baseLines[i] || ''
      const localLine = localLines[i] || ''
      const remoteLine = remoteLines[i] || ''

      if (localLine === remoteLine) {
        // Both made same change or neither changed
        result.push(localLine)
      } else if (localLine === baseLine) {
        // Only remote changed
        result.push(remoteLine)
      } else if (remoteLine === baseLine) {
        // Only local changed
        result.push(localLine)
      } else {
        // Both changed differently - conflict
        hasConflict = true
        result.push(`<<<<<<< LOCAL`)
        result.push(localLine)
        result.push(`=======`)
        result.push(remoteLine)
        result.push(`>>>>>>> REMOTE`)
      }
    }

    return {
      result: result.join('\n'),
      hasConflict
    }
  }

  // Private methods

  private compareObjects(
    local: any,
    remote: any,
    path: string[],
    conflicts: ConflictInfo[],
    localMeta: { timestamp: number; userId: string },
    remoteMeta: { timestamp: number; userId: string }
  ) {
    if (local === remote) return

    // Handle primitives
    if (typeof local !== 'object' || typeof remote !== 'object' || local === null || remote === null) {
      if (local !== remote) {
        conflicts.push({
          id: `conflict-${path.join('.')}-${Date.now()}`,
          type: 'attribute',
          path,
          localValue: local,
          remoteValue: remote,
          localTimestamp: localMeta.timestamp,
          remoteTimestamp: remoteMeta.timestamp,
          localUser: localMeta.userId,
          remoteUser: remoteMeta.userId,
          resolved: false
        })
      }
      return
    }

    // Handle arrays
    if (Array.isArray(local) && Array.isArray(remote)) {
      if (JSON.stringify(local) !== JSON.stringify(remote)) {
        conflicts.push({
          id: `conflict-${path.join('.')}-${Date.now()}`,
          type: 'array',
          path,
          localValue: local,
          remoteValue: remote,
          localTimestamp: localMeta.timestamp,
          remoteTimestamp: remoteMeta.timestamp,
          localUser: localMeta.userId,
          remoteUser: remoteMeta.userId,
          resolved: false
        })
      }
      return
    }

    // Handle objects
    const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)])

    for (const key of allKeys) {
      const localValue = local[key]
      const remoteValue = remote[key]

      if (localValue !== remoteValue) {
        this.compareObjects(
          localValue,
          remoteValue,
          [...path, key],
          conflicts,
          localMeta,
          remoteMeta
        )
      }
    }
  }

  private mergeValues(conflict: ConflictInfo): any {
    const { type, localValue, remoteValue } = conflict

    switch (type) {
      case 'text':
        // For text, concatenate with separator
        if (typeof localValue === 'string' && typeof remoteValue === 'string') {
          // Use timestamp to determine order
          return conflict.localTimestamp > conflict.remoteTimestamp
            ? localValue
            : remoteValue
        }
        return localValue

      case 'array':
        // Merge arrays, removing duplicates
        if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
          const merged = [...localValue]
          for (const item of remoteValue) {
            if (!merged.some(m => JSON.stringify(m) === JSON.stringify(item))) {
              merged.push(item)
            }
          }
          return merged
        }
        return localValue

      case 'object':
        // Deep merge objects
        if (typeof localValue === 'object' && typeof remoteValue === 'object') {
          return this.deepMerge(localValue, remoteValue)
        }
        return localValue

      default:
        // For attributes, use last-write-wins as fallback
        return conflict.localTimestamp > conflict.remoteTimestamp
          ? localValue
          : remoteValue
    }
  }

  private deepMerge(target: any, source: any): any {
    if (!source) return target
    if (!target) return source

    const output = { ...target }

    for (const key of Object.keys(source)) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key], source[key])
      } else {
        output[key] = source[key]
      }
    }

    return output
  }

  private setNestedValue(obj: any, path: string[], value: any) {
    let current = obj
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {}
      }
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  private notifyListeners() {
    const conflicts = this.getPendingConflicts()
    this.listeners.forEach(cb => cb(conflicts))
  }
}

/**
 * Create a conflict resolver instance
 */
export function createConflictResolver(options?: Partial<ConflictResolutionOptions>): ConflictResolver {
  return new ConflictResolver(options)
}

/**
 * Helper to generate conflict markers for text
 */
export function generateConflictMarkers(local: string, remote: string, localUser: string, remoteUser: string): string {
  return `<<<<<<< ${localUser} (LOCAL)
${local}
=======
${remote}
>>>>>>> ${remoteUser} (REMOTE)`
}

/**
 * Parse conflict markers from text
 */
export function parseConflictMarkers(text: string): Array<{ local: string; remote: string; start: number; end: number }> {
  const conflicts: Array<{ local: string; remote: string; start: number; end: number }> = []
  const regex = /<<<<<<< .+?\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> .+?/g

  let match
  while ((match = regex.exec(text)) !== null) {
    conflicts.push({
      local: match[1],
      remote: match[2],
      start: match.index,
      end: match.index + match[0].length
    })
  }

  return conflicts
}

/**
 * Resolve conflict markers in text
 */
export function resolveConflictMarkers(
  text: string,
  resolutions: Array<{ start: number; end: number; value: string }>
): string {
  // Sort by position descending to avoid index shifting
  const sorted = [...resolutions].sort((a, b) => b.start - a.start)

  let result = text
  for (const resolution of sorted) {
    result = result.slice(0, resolution.start) + resolution.value + result.slice(resolution.end)
  }

  return result
}
