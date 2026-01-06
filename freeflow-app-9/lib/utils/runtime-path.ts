/**
 * Runtime Path Utilities
 *
 * These utilities construct file paths at runtime in a way that
 * avoids Turbopack's static analysis warnings about broad file patterns.
 *
 * Turbopack analyzes path.join() calls statically and warns when
 * dynamic patterns could match many files. Using these utilities
 * prevents those warnings while maintaining the same functionality.
 */

import { sep, join as pathJoin, resolve as pathResolve, basename, extname, dirname } from 'path';

/**
 * Joins path segments at runtime, avoiding static analysis
 * @param segments Path segments to join
 * @returns Joined path string
 */
export function runtimeJoin(...segments: string[]): string {
  // Using reduce prevents Turbopack from statically analyzing this
  return segments.reduce((acc, segment, index) => {
    if (index === 0) return segment;
    // Handle both forward and backward slashes
    const cleanAcc = acc.endsWith(sep) || acc.endsWith('/') ? acc.slice(0, -1) : acc;
    const cleanSeg = segment.startsWith(sep) || segment.startsWith('/') ? segment.slice(1) : segment;
    return `${cleanAcc}${sep}${cleanSeg}`;
  }, '');
}

/**
 * Resolves an absolute path at runtime
 * @param segments Path segments to resolve
 * @returns Resolved absolute path
 */
export function runtimeResolve(...segments: string[]): string {
  return pathResolve(runtimeJoin(...segments));
}

/**
 * Creates a file path with extension at runtime
 * @param dir Directory path
 * @param name Base filename (without extension)
 * @param ext File extension (with or without dot)
 * @returns Full file path
 */
export function runtimeFilePath(dir: string, name: string, ext: string): string {
  const extension = ext.startsWith('.') ? ext : `.${ext}`;
  return runtimeJoin(dir, `${name}${extension}`);
}

/**
 * Creates an output path based on input file
 * @param inputPath Input file path
 * @param outputDir Output directory
 * @param newExt New file extension (optional)
 * @returns Output file path
 */
export function runtimeOutputPath(inputPath: string, outputDir: string, newExt?: string): string {
  const base = basename(inputPath, extname(inputPath));
  const ext = newExt || extname(inputPath);
  return runtimeFilePath(outputDir, base, ext);
}

/**
 * Creates a path with a unique identifier
 * @param dir Directory path
 * @param prefix Filename prefix
 * @param ext File extension
 * @param id Unique identifier
 * @returns File path with unique ID
 */
export function runtimeUniquePath(dir: string, prefix: string, ext: string, id: string): string {
  return runtimeFilePath(dir, `${prefix}-${id}`, ext);
}

/**
 * Creates a timestamped path
 * @param dir Directory path
 * @param prefix Filename prefix
 * @param ext File extension
 * @returns File path with timestamp
 */
export function runtimeTimestampPath(dir: string, prefix: string, ext: string): string {
  const timestamp = Date.now();
  return runtimeFilePath(dir, `${prefix}-${timestamp}`, ext);
}

/**
 * Creates a temp directory path
 * @param subdir Subdirectory name
 * @param id Optional unique identifier
 * @returns Temp directory path
 */
export function runtimeTempPath(subdir: string, id?: string): string {
  const base = '/tmp';
  if (id) {
    return runtimeJoin(base, subdir, id);
  }
  return runtimeJoin(base, subdir);
}

// Re-export path utilities for convenience
export { basename, extname, dirname, sep };
