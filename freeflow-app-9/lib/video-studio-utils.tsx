/**
 * ========================================
 * VIDEO STUDIO UTILITIES
 * ========================================
 *
 * Comprehensive TypeScript utilities for Video Studio
 * - Type definitions and interfaces
 * - Mock data generators
 * - Helper functions
 * - Video processing utilities
 *
 * Created: 2024-11-26
 * Session: 8 - Video Studio Refactoring
 */

import {
  Play, Video, FileVideo, Music, Image as ImageIcon,
  Type, Sparkles, Award, TrendingUp, Clock
} from 'lucide-react'
import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('VideoStudioUtils')

// ========================================
// TYPE DEFINITIONS
// ========================================

export type VideoStatus = 'draft' | 'processing' | 'ready' | 'published' | 'archived'
export type VideoQuality = 'low' | 'medium' | 'high' | 'ultra' | '4k' | '8k'
export type AssetType = 'video' | 'audio' | 'image' | 'font' | 'transition' | 'effect' | 'overlay'
export type RecordingType = 'screen' | 'webcam' | 'both' | 'audio'
export type ExportFormat = 'mp4' | 'mov' | 'webm' | 'avi' | 'mkv'
export type TimelineItemType = 'video' | 'audio' | 'image' | 'text' | 'transition' | 'effect'
export type CaptionFormat = 'srt' | 'vtt' | 'ass' | 'json'
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed'

// ========================================
// INTERFACES
// ========================================

export interface VideoMetadata {
  fps: number
  bitrate: number
  codec: string
  colorSpace: string
  hasAudio: boolean
  audioCodec?: string
  channels?: number
  sampleRate?: number
  width: number
  height: number
}

export interface VideoProject {
  id: string
  title: string
  description: string
  duration: number // in seconds
  resolution: string
  format: ExportFormat
  fileSize: number // in bytes
  filePath: string
  thumbnailPath: string
  createdAt: string
  updatedAt: string
  status: VideoStatus
  userId: string
  clientId?: string
  projectId?: string
  views: number
  likes: number
  comments: number
  shares: number
  downloads: number
  tags: string[]
  metadata: VideoMetadata
  category: string
}

export interface VideoTemplate {
  id: string
  name: string
  description: string
  category: string
  duration: number
  resolution: string
  thumbnailPath: string
  previewUrl: string
  isPremium: boolean
  price?: number
  usageCount: number
  rating: number
  reviews: number
  tags: string[]
  createdAt: string
  features: string[]
}

export interface VideoAsset {
  id: string
  name: string
  type: AssetType
  duration?: number
  fileSize: number
  format: string
  filePath: string
  thumbnailPath: string
  createdAt: string
  tags: string[]
  metadata: any
  category: string
}

export interface VideoAnalytics {
  projectId: string
  views: number
  uniqueViews: number
  averageWatchTime: number
  completionRate: number
  engagement: number
  shares: number
  downloads: number
  comments: number
  likes: number
  dislikes: number
  topLocations: { country: string; views: number }[]
  deviceBreakdown: { device: string; percentage: number }[]
  trafficSources: { source: string; percentage: number }[]
}

export interface RecordingSettings {
  type: RecordingType
  quality: VideoQuality
  resolution: string
  fps: number
  audioEnabled: boolean
  microphoneId?: string
  cameraId?: string
  screenId?: string
  bitrate: number
}

export interface EditorState {
  timeline: TimelineItem[]
  selectedItem: string | null
  playheadPosition: number
  zoom: number
  volume: number
  isMuted: boolean
  isPlaying: boolean
  duration: number
}

export interface TimelineItem {
  id: string
  type: TimelineItemType
  startTime: number
  endTime: number
  duration: number
  assetId?: string
  properties: Record<string, any>
  layer: number
}

export interface VideoTranscript {
  id: string
  projectId: string
  status: TranscriptionStatus
  language: string
  text: string
  timestamps: { start: number; end: number; text: string }[]
  confidence: number
  createdAt: string
}

export interface VideoCaption {
  id: string
  projectId: string
  language: string
  format: CaptionFormat
  filePath: string
  isDefault: boolean
  createdAt: string
}

// ========================================
// MOCK DATA
// ========================================
// MIGRATED: Batch #10 - Removed mock data, using database hooks

export const MOCK_VIDEO_PROJECTS: VideoProject[] = []

export const MOCK_VIDEO_TEMPLATES: VideoTemplate[] = []

export const MOCK_VIDEO_ASSETS: VideoAsset[] = []

// ========================================
// HELPER FUNCTIONS
// ========================================

export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function formatBitrate(bps: number): string {
  if (bps < 1000000) {
    return `${Math.floor(bps / 1000)} kbps`
  }
  return `${(bps / 1000000).toFixed(1)} Mbps`
}

export function formatResolution(width: number, height: number): string {
  if (width === 1920 && height === 1080) return '1080p'
  if (width === 1280 && height === 720) return '720p'
  if (width === 3840 && height === 2160) return '4K'
  if (width === 7680 && height === 4320) return '8K'
  if (width === 1080 && height === 1920) return '1080p Vertical'
  return `${width}x${height}`
}

export function calculateVideoSize(duration: number, bitrate: number): number {
  return Math.floor((duration * bitrate) / 8)
}

export function getVideoQualityLabel(resolution: string): string {
  if (resolution === '3840x2160') return '4K Ultra HD'
  if (resolution === '1920x1080') return 'Full HD'
  if (resolution === '1280x720') return 'HD'
  if (resolution === '7680x4320') return '8K'
  return resolution
}

export function getStatusColor(status: VideoStatus): string {
  const colors: Record<VideoStatus, string> = {
    draft: 'gray',
    processing: 'blue',
    ready: 'green',
    published: 'purple',
    archived: 'slate'
  }
  return colors[status] || 'gray'
}

export function getStatusIcon(status: VideoStatus) {
  const icons: Record<VideoStatus, any> = {
    draft: FileVideo,
    processing: Clock,
    ready: Play,
    published: TrendingUp,
    archived: Award
  }
  return icons[status] || FileVideo
}

export function getTemplateCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Marketing: 'purple',
    Social: 'pink',
    Business: 'blue',
    Education: 'green',
    Entertainment: 'amber',
    Testimonial: 'cyan'
  }
  return colors[category] || 'gray'
}

export function getAssetTypeIcon(type: AssetType) {
  const icons: Record<AssetType, any> = {
    video: Video,
    audio: Music,
    image: ImageIcon,
    font: Type,
    transition: Sparkles,
    effect: Sparkles,
    overlay: ImageIcon
  }
  return icons[type] || FileVideo
}

export function calculateCompletionRate(views: number, completions: number): number {
  if (views === 0) return 0
  return Math.min(100, Math.round((completions / views) * 100))
}

export function calculateEngagementScore(analytics: VideoAnalytics): number {
  const {
    views,
    likes,
    comments,
    shares,
    completionRate,
    averageWatchTime
  } = analytics

  if (views === 0) return 0

  const likeRate = (likes / views) * 100
  const commentRate = (comments / views) * 100
  const shareRate = (shares / views) * 100

  const score =
    likeRate * 0.3 +
    commentRate * 0.2 +
    shareRate * 0.2 +
    completionRate * 0.2 +
    averageWatchTime * 0.1

  return Math.min(100, Math.round(score))
}

export function sortProjectsByDate(projects: VideoProject[]): VideoProject[] {
  return [...projects].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function sortProjectsByViews(projects: VideoProject[]): VideoProject[] {
  return [...projects].sort((a, b) => b.views - a.views)
}

export function filterProjectsByStatus(
  projects: VideoProject[],
  status: VideoStatus
): VideoProject[] {
  return projects.filter(p => p.status === status)
}

export function filterProjectsByTag(
  projects: VideoProject[],
  tag: string
): VideoProject[] {
  return projects.filter(p => p.tags.includes(tag.toLowerCase()))
}

export function searchProjects(
  projects: VideoProject[],
  query: string
): VideoProject[] {
  const lowercaseQuery = query.toLowerCase()
  return projects.filter(
    p =>
      p.title.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function getTopPerformingProjects(
  projects: VideoProject[],
  limit: number = 10
): VideoProject[] {
  return sortProjectsByViews(projects).slice(0, limit)
}

export function getProjectsByCategory(
  projects: VideoProject[],
  category: string
): VideoProject[] {
  return projects.filter(p => p.category === category)
}

export function getRecentProjects(
  projects: VideoProject[],
  days: number = 7
): VideoProject[] {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return projects.filter(p => new Date(p.createdAt) > cutoff)
}

export function getTotalVideoDuration(projects: VideoProject[]): number {
  return projects.reduce((sum, p) => sum + p.duration, 0)
}

export function getTotalStorageUsed(projects: VideoProject[]): number {
  return projects.reduce((sum, p) => sum + p.fileSize, 0)
}

export function getAverageVideoLength(projects: VideoProject[]): number {
  if (projects.length === 0) return 0
  return Math.floor(getTotalVideoDuration(projects) / projects.length)
}

export function getPublishedProjects(projects: VideoProject[]): VideoProject[] {
  return filterProjectsByStatus(projects, 'published')
}

export function getDraftProjects(projects: VideoProject[]): VideoProject[] {
  return filterProjectsByStatus(projects, 'draft')
}

export function getProcessingProjects(projects: VideoProject[]): VideoProject[] {
  return filterProjectsByStatus(projects, 'processing')
}

logger.info('Video Studio utilities loaded', {
  projects: MOCK_VIDEO_PROJECTS.length,
  templates: MOCK_VIDEO_TEMPLATES.length,
  assets: MOCK_VIDEO_ASSETS.length
})
