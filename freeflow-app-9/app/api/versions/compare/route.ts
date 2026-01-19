/**
 * Version Compare API - FreeFlow A+++ Implementation
 * Compare two document versions with detailed diff analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface DiffResult {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  lineNumber: {
    old?: number;
    new?: number;
  };
  content: string;
  oldContent?: string;
}

interface CompareResult {
  oldVersion: {
    id: string;
    versionNumber: number;
    createdAt: string;
    wordCount: number;
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  newVersion: {
    id: string;
    versionNumber: number;
    createdAt: string;
    wordCount: number;
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  stats: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    linesUnchanged: number;
    wordDifference: number;
  };
  diff: DiffResult[];
}

// GET - Compare two versions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const oldVersionId = searchParams.get('oldVersionId');
    const newVersionId = searchParams.get('newVersionId');

    if (!oldVersionId || !newVersionId) {
      return NextResponse.json(
        { error: 'Both oldVersionId and newVersionId are required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch both versions
    const { data: oldVersion, error: oldError } = await supabase
      .from('document_versions')
      .select(`
        id,
        version_number,
        created_at,
        content_snapshot,
        word_count,
        author:users!document_versions_created_by_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .eq('id', oldVersionId)
      .single();

    const { data: newVersion, error: newError } = await supabase
      .from('document_versions')
      .select(`
        id,
        version_number,
        created_at,
        content_snapshot,
        word_count,
        author:users!document_versions_created_by_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .eq('id', newVersionId)
      .single();

    if (oldError || newError || !oldVersion || !newVersion) {
      return NextResponse.json(
        { error: 'One or both versions not found' },
        { status: 404 }
      );
    }

    // Compute diff
    const diff = computeDiff(
      oldVersion.content_snapshot || '',
      newVersion.content_snapshot || ''
    );

    // Calculate stats
    const stats = {
      linesAdded: diff.filter(d => d.type === 'added').length,
      linesRemoved: diff.filter(d => d.type === 'removed').length,
      linesModified: diff.filter(d => d.type === 'modified').length,
      linesUnchanged: diff.filter(d => d.type === 'unchanged').length,
      wordDifference: (newVersion.word_count || 0) - (oldVersion.word_count || 0),
    };

    const result: CompareResult = {
      oldVersion: {
        id: oldVersion.id,
        versionNumber: oldVersion.version_number,
        createdAt: oldVersion.created_at,
        wordCount: oldVersion.word_count || 0,
        author: oldVersion.author ? {
          id: oldVersion.author.id,
          name: oldVersion.author.name,
          avatar: oldVersion.author.avatar_url,
        } : undefined,
      },
      newVersion: {
        id: newVersion.id,
        versionNumber: newVersion.version_number,
        createdAt: newVersion.created_at,
        wordCount: newVersion.word_count || 0,
        author: newVersion.author ? {
          id: newVersion.author.id,
          name: newVersion.author.name,
          avatar: newVersion.author.avatar_url,
        } : undefined,
      },
      stats,
      diff,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/versions/compare:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Compute line-by-line diff
function computeDiff(oldText: string, newText: string): DiffResult[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diff: DiffResult[] = [];

  // Use LCS (Longest Common Subsequence) based diff for better results
  const lcs = computeLCS(oldLines, newLines);

  let oldIndex = 0;
  let newIndex = 0;
  let lcsIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (lcsIndex < lcs.length && oldIndex < oldLines.length && oldLines[oldIndex] === lcs[lcsIndex]) {
      if (newIndex < newLines.length && newLines[newIndex] === lcs[lcsIndex]) {
        // Unchanged line
        diff.push({
          type: 'unchanged',
          lineNumber: { old: oldIndex + 1, new: newIndex + 1 },
          content: newLines[newIndex],
        });
        oldIndex++;
        newIndex++;
        lcsIndex++;
      } else {
        // Line added in new version
        diff.push({
          type: 'added',
          lineNumber: { new: newIndex + 1 },
          content: newLines[newIndex],
        });
        newIndex++;
      }
    } else if (lcsIndex < lcs.length && newIndex < newLines.length && newLines[newIndex] === lcs[lcsIndex]) {
      // Line removed from old version
      diff.push({
        type: 'removed',
        lineNumber: { old: oldIndex + 1 },
        content: oldLines[oldIndex],
      });
      oldIndex++;
    } else if (oldIndex < oldLines.length && newIndex < newLines.length) {
      // Modified line (different content at same position after LCS)
      diff.push({
        type: 'modified',
        lineNumber: { old: oldIndex + 1, new: newIndex + 1 },
        content: newLines[newIndex],
        oldContent: oldLines[oldIndex],
      });
      oldIndex++;
      newIndex++;
    } else if (newIndex < newLines.length) {
      // Remaining additions
      diff.push({
        type: 'added',
        lineNumber: { new: newIndex + 1 },
        content: newLines[newIndex],
      });
      newIndex++;
    } else if (oldIndex < oldLines.length) {
      // Remaining deletions
      diff.push({
        type: 'removed',
        lineNumber: { old: oldIndex + 1 },
        content: oldLines[oldIndex],
      });
      oldIndex++;
    }
  }

  return diff;
}

// Compute LCS (Longest Common Subsequence) of two arrays
function computeLCS(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length;
  const n = arr2.length;

  // Create DP table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}
