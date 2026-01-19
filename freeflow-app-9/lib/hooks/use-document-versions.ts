'use client';

/**
 * Document Versions Hooks - FreeFlow A+++ Implementation
 * React Query hooks for version history management
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  documentId: string;
  createdBy: string;
  createdAt: string;
  label?: string;
  description?: string;
  contentSnapshot: string;
  wordCount: number;
  changeSummary?: string;
  isAutoSave: boolean;
  isCheckpoint: boolean;
  metadata?: Record<string, unknown>;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
}

export interface VersionsResponse {
  versions: DocumentVersion[];
  total: number;
  limit: number;
  offset: number;
}

export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  lineNumber: {
    old?: number;
    new?: number;
  };
  content: string;
  oldContent?: string;
}

export interface CompareResult {
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
  diff: DiffLine[];
}

export interface CreateVersionPayload {
  documentId: string;
  contentSnapshot: string;
  label?: string;
  description?: string;
  changeSummary?: string;
  isCheckpoint?: boolean;
  isAutoSave?: boolean;
  wordCount?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateVersionPayload {
  id: string;
  label?: string;
  description?: string;
  isCheckpoint?: boolean;
}

export interface RestoreVersionPayload {
  versionId: string;
  createCheckpoint?: boolean;
  checkpointLabel?: string;
}

// ============================================================================
// Query Keys
// ============================================================================

export const versionKeys = {
  all: ['versions'] as const,
  lists: () => [...versionKeys.all, 'list'] as const,
  list: (documentId: string, params?: Record<string, unknown>) =>
    [...versionKeys.lists(), documentId, params] as const,
  details: () => [...versionKeys.all, 'detail'] as const,
  detail: (id: string) => [...versionKeys.details(), id] as const,
  compare: (oldId: string, newId: string) =>
    [...versionKeys.all, 'compare', oldId, newId] as const,
};

// ============================================================================
// API Functions
// ============================================================================

async function fetchVersions(
  documentId: string,
  params?: {
    limit?: number;
    offset?: number;
    checkpointsOnly?: boolean;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<VersionsResponse> {
  const searchParams = new URLSearchParams({
    documentId,
    ...(params?.limit && { limit: params.limit.toString() }),
    ...(params?.offset && { offset: params.offset.toString() }),
    ...(params?.checkpointsOnly && { checkpointsOnly: 'true' }),
    ...(params?.sortOrder && { sortOrder: params.sortOrder }),
  });

  const response = await fetch(`/api/versions?${searchParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch versions');
  }

  return response.json();
}

async function fetchVersion(id: string): Promise<DocumentVersion> {
  const response = await fetch(`/api/versions?id=${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch version');
  }

  const data = await response.json();
  return data.versions?.[0] || data;
}

async function createVersion(payload: CreateVersionPayload): Promise<DocumentVersion> {
  const response = await fetch('/api/versions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create version');
  }

  return response.json();
}

async function updateVersion(payload: UpdateVersionPayload): Promise<DocumentVersion> {
  const response = await fetch('/api/versions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update version');
  }

  return response.json();
}

async function deleteVersion(id: string): Promise<void> {
  const response = await fetch(`/api/versions?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete version');
  }
}

async function compareVersions(oldVersionId: string, newVersionId: string): Promise<CompareResult> {
  const response = await fetch(
    `/api/versions/compare?oldVersionId=${oldVersionId}&newVersionId=${newVersionId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to compare versions');
  }

  return response.json();
}

async function restoreVersion(
  payload: RestoreVersionPayload
): Promise<{ success: boolean; message: string; newVersion: DocumentVersion }> {
  const response = await fetch('/api/versions/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to restore version');
  }

  return response.json();
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch all versions for a document
 */
export function useDocumentVersions(
  documentId: string,
  params?: {
    limit?: number;
    offset?: number;
    checkpointsOnly?: boolean;
    sortOrder?: 'asc' | 'desc';
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: versionKeys.list(documentId, params),
    queryFn: () => fetchVersions(documentId, params),
    enabled: !!documentId && (options?.enabled !== false),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch a single version
 */
export function useDocumentVersion(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: versionKeys.detail(id),
    queryFn: () => fetchVersion(id),
    enabled: !!id && (options?.enabled !== false),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Create a new version (auto-save or checkpoint)
 */
export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVersion,
    onSuccess: (newVersion) => {
      // Invalidate the list
      queryClient.invalidateQueries({
        queryKey: versionKeys.list(newVersion.documentId),
      });
    },
  });
}

/**
 * Create a checkpoint (named version)
 */
export function useCreateCheckpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateVersionPayload, 'isCheckpoint'>) =>
      createVersion({ ...payload, isCheckpoint: true, isAutoSave: false }),
    onSuccess: (newVersion) => {
      queryClient.invalidateQueries({
        queryKey: versionKeys.list(newVersion.documentId),
      });
    },
  });
}

/**
 * Auto-save a version (background save without creating checkpoint)
 */
export function useAutoSaveVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateVersionPayload, 'isAutoSave' | 'isCheckpoint'>) =>
      createVersion({ ...payload, isAutoSave: true, isCheckpoint: false }),
    onSuccess: (newVersion) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        versionKeys.list(newVersion.documentId),
        (old: VersionsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            versions: [newVersion, ...old.versions.slice(0, old.limit - 1)],
            total: old.total + 1,
          };
        }
      );
    },
  });
}

/**
 * Update version metadata (label, description)
 */
export function useUpdateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVersion,
    onSuccess: (updatedVersion) => {
      // Update the specific version in cache
      queryClient.setQueryData(versionKeys.detail(updatedVersion.id), updatedVersion);

      // Invalidate the list
      queryClient.invalidateQueries({
        queryKey: versionKeys.list(updatedVersion.documentId),
      });
    },
  });
}

/**
 * Delete a version (only auto-saves can be deleted)
 */
export function useDeleteVersion(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: versionKeys.list(documentId),
      });
    },
  });
}

/**
 * Compare two versions
 */
export function useCompareVersions(
  oldVersionId: string,
  newVersionId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: versionKeys.compare(oldVersionId, newVersionId),
    queryFn: () => compareVersions(oldVersionId, newVersionId),
    enabled: !!oldVersionId && !!newVersionId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes (diffs don't change)
  });
}

/**
 * Restore a document to a previous version
 */
export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreVersion,
    onSuccess: (result) => {
      // Invalidate the versions list
      queryClient.invalidateQueries({
        queryKey: versionKeys.list(result.newVersion.documentId),
      });

      // Invalidate document queries
      queryClient.invalidateQueries({
        queryKey: ['documents', result.newVersion.documentId],
      });
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get version statistics for a document
 */
export function useVersionStats(documentId: string, options?: { enabled?: boolean }) {
  const { data, isLoading, error } = useDocumentVersions(
    documentId,
    { limit: 1000 },
    options
  );

  const stats = data?.versions
    ? {
        totalVersions: data.total,
        checkpointCount: data.versions.filter((v) => v.isCheckpoint).length,
        autoSaveCount: data.versions.filter((v) => v.isAutoSave).length,
        latestVersion: data.versions[0],
        latestCheckpoint: data.versions.find((v) => v.isCheckpoint),
        wordCountHistory: data.versions.map((v) => ({
          date: v.createdAt,
          wordCount: v.wordCount,
        })),
      }
    : null;

  return { stats, isLoading, error };
}

/**
 * Hook for managing version selection (for comparison)
 */
export function useVersionSelection() {
  const [selectedVersions, setSelectedVersions] = useState<{
    old: string | null;
    new: string | null;
  }>({
    old: null,
    new: null,
  });

  const selectForComparison = (versionId: string, slot: 'old' | 'new') => {
    setSelectedVersions((prev) => ({
      ...prev,
      [slot]: versionId,
    }));
  };

  const clearSelection = () => {
    setSelectedVersions({ old: null, new: null });
  };

  const canCompare = selectedVersions.old && selectedVersions.new;

  return {
    selectedVersions,
    selectForComparison,
    clearSelection,
    canCompare,
  };
}
