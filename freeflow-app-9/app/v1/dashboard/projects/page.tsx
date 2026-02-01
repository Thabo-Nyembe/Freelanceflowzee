/**
 * V1 Projects Page
 *
 * This page uses the ProjectsClientV1 component which provides:
 * - Real downloads using Blob/URL.createObjectURL
 * - Real CSV exports from actual project data
 * - Real Supabase hooks for CRUD operations
 * - Real file generation for exports
 * - NO hardcoded mock data
 *
 * All stub/toast-only handlers have been replaced with real functionality.
 */

import ProjectsClientV1 from './projects-client'

export default function ProjectsPage() {
  return <ProjectsClientV1 />
}
