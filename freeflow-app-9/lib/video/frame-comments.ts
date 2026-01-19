/**
 * Frame-Accurate Video Comments System - FreeFlow A+++ Implementation
 * Frame.io-style video commenting with spatial annotations
 */

// =====================================================
// TYPES
// =====================================================

export type VideoCommentType = 'point' | 'region' | 'drawing' | 'text' | 'arrow' | 'audio';
export type CommentStatus = 'active' | 'resolved' | 'archived';
export type ReviewStatus = 'pending' | 'in_progress' | 'changes_requested' | 'approved' | 'rejected';
export type CommentPriority = 0 | 1 | 2; // 0: normal, 1: important, 2: critical

export interface Point {
  x: number;
  y: number;
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface DrawingData {
  strokes: Stroke[];
}

export interface Annotation {
  type: VideoCommentType;
  point?: Point;
  region?: Region;
  path?: string; // SVG path for complex shapes
}

export interface VideoAsset {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  durationMs: number;
  frameRate: number;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  reviewStatus: ReviewStatus;
  isPublic: boolean;
  allowComments: boolean;
  allowDownloads: boolean;
  version: number;
  parentVersionId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  parentId?: string;
  timestampMs: number;
  endTimestampMs?: number;
  frameNumber: number;
  content: string;
  commentType: VideoCommentType;
  status: CommentStatus;
  annotation?: Annotation;
  drawingData?: DrawingData;
  audioUrl?: string;
  audioDurationMs?: number;
  mentionedUsers: string[];
  assignedTo?: string;
  priority: CommentPriority;
  category?: string;
  tags: string[];
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  // Populated fields
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  replies?: VideoComment[];
  reactionCounts?: Record<string, number>;
}

export interface VideoMarker {
  id: string;
  videoId: string;
  userId: string;
  timestampMs: number;
  durationMs?: number;
  title: string;
  description?: string;
  color: string;
  icon?: string;
  markerType: 'bookmark' | 'chapter' | 'note' | 'todo';
  createdAt: string;
  updatedAt: string;
}

export interface VideoReviewSession {
  id: string;
  videoId: string;
  createdBy: string;
  title?: string;
  description?: string;
  status: ReviewStatus;
  dueDate?: string;
  requiredApprovers: number;
  approvalCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ReviewParticipant {
  id: string;
  sessionId: string;
  userId?: string;
  email?: string;
  inviteToken: string;
  role: 'reviewer' | 'approver' | 'viewer';
  canComment: boolean;
  canDownload: boolean;
  status: 'pending' | 'viewed' | 'commented' | 'approved' | 'rejected';
  lastViewedAt?: string;
  decisionAt?: string;
  decisionNotes?: string;
  invitedAt: string;
  joinedAt?: string;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate frame number from timestamp and frame rate
 */
export function calculateFrameNumber(timestampMs: number, frameRate: number): number {
  return Math.floor((timestampMs / 1000) * frameRate);
}

/**
 * Calculate timestamp from frame number and frame rate
 */
export function calculateTimestampMs(frameNumber: number, frameRate: number): number {
  return Math.round((frameNumber / frameRate) * 1000);
}

/**
 * Convert milliseconds to SMPTE timecode (HH:MM:SS:FF)
 */
export function msToSMPTE(timestampMs: number, frameRate: number): string {
  const fps = Math.floor(frameRate);
  const totalFrames = calculateFrameNumber(timestampMs, frameRate);

  const frames = totalFrames % fps;
  let remaining = Math.floor(totalFrames / fps);

  const seconds = remaining % 60;
  remaining = Math.floor(remaining / 60);

  const minutes = remaining % 60;
  const hours = Math.floor(remaining / 60);

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
    String(frames).padStart(2, '0'),
  ].join(':');
}

/**
 * Parse SMPTE timecode to milliseconds
 */
export function smpteToMs(smpte: string, frameRate: number): number {
  const parts = smpte.split(':').map(Number);
  if (parts.length !== 4) throw new Error('Invalid SMPTE format');

  const [hours, minutes, seconds, frames] = parts;
  const fps = Math.floor(frameRate);

  const totalFrames =
    frames + seconds * fps + minutes * 60 * fps + hours * 3600 * fps;

  return calculateTimestampMs(totalFrames, frameRate);
}

/**
 * Format milliseconds to human-readable duration
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * Format milliseconds to detailed timestamp
 */
export function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const remainingMs = ms % 1000;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}.${String(remainingMs).padStart(3, '0')}`;
}

// =====================================================
// DRAWING UTILITIES
// =====================================================

/**
 * Create smooth path from points (Catmull-Rom spline)
 */
export function createSmoothPath(points: Point[]): string {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  if (points.length === 2) {
    path += ` L ${points[1].x} ${points[1].y}`;
    return path;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Simplify path using Ramer-Douglas-Peucker algorithm
 */
export function simplifyPath(points: Point[], epsilon: number = 2): Point[] {
  if (points.length < 3) return points;

  const findPerpendicularDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lineLengthSquared = dx * dx + dy * dy;

    if (lineLengthSquared === 0) {
      return Math.sqrt(
        (point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2
      );
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lineLengthSquared
      )
    );

    const projectionX = lineStart.x + t * dx;
    const projectionY = lineStart.y + t * dy;

    return Math.sqrt(
      (point.x - projectionX) ** 2 + (point.y - projectionY) ** 2
    );
  };

  let maxDistance = 0;
  let maxIndex = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const distance = findPerpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1]
    );
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > epsilon) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon);
    const right = simplifyPath(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[points.length - 1]];
}

// =====================================================
// ANNOTATION HELPERS
// =====================================================

/**
 * Check if a point is inside an annotation region
 */
export function isPointInAnnotation(point: Point, annotation: Annotation): boolean {
  if (annotation.type === 'point' && annotation.point) {
    const threshold = 20; // Click tolerance in pixels
    const dx = point.x - annotation.point.x;
    const dy = point.y - annotation.point.y;
    return Math.sqrt(dx * dx + dy * dy) <= threshold;
  }

  if (annotation.type === 'region' && annotation.region) {
    const { x, y, width, height } = annotation.region;
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }

  return false;
}

/**
 * Create annotation from drawing bounds
 */
export function createAnnotationFromDrawing(drawing: DrawingData): Annotation {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const stroke of drawing.strokes) {
    for (const point of stroke.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  return {
    type: 'drawing',
    region: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
}

/**
 * Convert normalized coordinates (0-1) to pixel coordinates
 */
export function normalizedToPixels(
  normalized: Point,
  containerWidth: number,
  containerHeight: number
): Point {
  return {
    x: normalized.x * containerWidth,
    y: normalized.y * containerHeight,
  };
}

/**
 * Convert pixel coordinates to normalized coordinates (0-1)
 */
export function pixelsToNormalized(
  pixels: Point,
  containerWidth: number,
  containerHeight: number
): Point {
  return {
    x: pixels.x / containerWidth,
    y: pixels.y / containerHeight,
  };
}

// =====================================================
// COMMENT FILTERING & SORTING
// =====================================================

export interface CommentFilters {
  status?: CommentStatus[];
  priority?: CommentPriority[];
  type?: VideoCommentType[];
  userId?: string;
  timeRange?: { start: number; end: number };
  hasReplies?: boolean;
  isResolved?: boolean;
  category?: string;
  tags?: string[];
  searchQuery?: string;
}

/**
 * Filter comments based on criteria
 */
export function filterComments(
  comments: VideoComment[],
  filters: CommentFilters
): VideoComment[] {
  return comments.filter((comment) => {
    if (filters.status && !filters.status.includes(comment.status)) {
      return false;
    }
    if (filters.priority && !filters.priority.includes(comment.priority)) {
      return false;
    }
    if (filters.type && !filters.type.includes(comment.commentType)) {
      return false;
    }
    if (filters.userId && comment.userId !== filters.userId) {
      return false;
    }
    if (filters.timeRange) {
      if (
        comment.timestampMs < filters.timeRange.start ||
        comment.timestampMs > filters.timeRange.end
      ) {
        return false;
      }
    }
    if (filters.hasReplies !== undefined) {
      const hasReplies = (comment.replies?.length ?? 0) > 0;
      if (hasReplies !== filters.hasReplies) return false;
    }
    if (filters.isResolved !== undefined) {
      const isResolved = comment.status === 'resolved';
      if (isResolved !== filters.isResolved) return false;
    }
    if (filters.category && comment.category !== filters.category) {
      return false;
    }
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) => comment.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!comment.content.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export type CommentSortField = 'timestamp' | 'created' | 'priority' | 'replies';

/**
 * Sort comments by field
 */
export function sortComments(
  comments: VideoComment[],
  field: CommentSortField,
  ascending: boolean = true
): VideoComment[] {
  const sorted = [...comments].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'timestamp':
        comparison = a.timestampMs - b.timestampMs;
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'priority':
        comparison = a.priority - b.priority;
        break;
      case 'replies':
        comparison = (a.replies?.length ?? 0) - (b.replies?.length ?? 0);
        break;
    }

    return ascending ? comparison : -comparison;
  });

  return sorted;
}

// =====================================================
// COMMENT GROUPING
// =====================================================

/**
 * Group comments by time segments
 */
export function groupCommentsByTime(
  comments: VideoComment[],
  segmentDurationMs: number = 10000
): Map<number, VideoComment[]> {
  const groups = new Map<number, VideoComment[]>();

  for (const comment of comments) {
    const segmentStart = Math.floor(comment.timestampMs / segmentDurationMs) * segmentDurationMs;

    if (!groups.has(segmentStart)) {
      groups.set(segmentStart, []);
    }
    groups.get(segmentStart)!.push(comment);
  }

  return groups;
}

/**
 * Build comment thread tree
 */
export function buildCommentThreads(comments: VideoComment[]): VideoComment[] {
  const commentMap = new Map<string, VideoComment>();
  const rootComments: VideoComment[] = [];

  // First pass: create map and initialize replies
  for (const comment of comments) {
    commentMap.set(comment.id, { ...comment, replies: [] });
  }

  // Second pass: build tree structure
  for (const comment of commentMap.values()) {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies!.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  }

  return rootComments;
}

// =====================================================
// KEYBOARD NAVIGATION
// =====================================================

export interface KeyboardShortcuts {
  nextComment: string;
  prevComment: string;
  newComment: string;
  resolveComment: string;
  deleteComment: string;
  playPause: string;
  seekForward: string;
  seekBackward: string;
  frameForward: string;
  frameBackward: string;
  toggleAnnotations: string;
}

export const DEFAULT_SHORTCUTS: KeyboardShortcuts = {
  nextComment: 'n',
  prevComment: 'p',
  newComment: 'c',
  resolveComment: 'r',
  deleteComment: 'Delete',
  playPause: 'Space',
  seekForward: 'ArrowRight',
  seekBackward: 'ArrowLeft',
  frameForward: '.',
  frameBackward: ',',
  toggleAnnotations: 'a',
};

// =====================================================
// EXPORT UTILITIES
// =====================================================

export interface CommentExport {
  videoTitle: string;
  videoUrl: string;
  exportedAt: string;
  comments: {
    timecode: string;
    author: string;
    content: string;
    status: string;
    priority: string;
    replies: {
      author: string;
      content: string;
      createdAt: string;
    }[];
  }[];
}

/**
 * Export comments to JSON format
 */
export function exportCommentsToJSON(
  video: VideoAsset,
  comments: VideoComment[],
  users: Map<string, { name: string }>
): CommentExport {
  const threadedComments = buildCommentThreads(comments);

  return {
    videoTitle: video.title,
    videoUrl: video.fileUrl,
    exportedAt: new Date().toISOString(),
    comments: threadedComments.map((comment) => ({
      timecode: msToSMPTE(comment.timestampMs, video.frameRate),
      author: users.get(comment.userId)?.name ?? 'Unknown',
      content: comment.content,
      status: comment.status,
      priority: ['Normal', 'Important', 'Critical'][comment.priority],
      replies: (comment.replies ?? []).map((reply) => ({
        author: users.get(reply.userId)?.name ?? 'Unknown',
        content: reply.content,
        createdAt: reply.createdAt,
      })),
    })),
  };
}

/**
 * Export comments to CSV format
 */
export function exportCommentsToCSV(
  video: VideoAsset,
  comments: VideoComment[],
  users: Map<string, { name: string }>
): string {
  const headers = ['Timecode', 'Frame', 'Author', 'Content', 'Status', 'Priority', 'Created At'];
  const rows = comments.map((comment) => [
    msToSMPTE(comment.timestampMs, video.frameRate),
    comment.frameNumber.toString(),
    users.get(comment.userId)?.name ?? 'Unknown',
    `"${comment.content.replace(/"/g, '""')}"`,
    comment.status,
    ['Normal', 'Important', 'Critical'][comment.priority],
    comment.createdAt,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
