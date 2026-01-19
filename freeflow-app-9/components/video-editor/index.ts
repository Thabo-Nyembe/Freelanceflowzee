/**
 * Video Editor Components
 *
 * Browser-based video editor using FFmpeg.wasm
 */

export { VideoEditor } from './video-editor'
export { default } from './video-editor'

// Re-export types from hook
export type {
  VideoFile,
  AudioFile,
  TimelineClip,
  Track,
  VideoProject,
  ProjectSettings,
  VideoFilter,
  Transition,
  ExportResult,
  FilterType,
  TransitionType,
  EditorState,
  PlaybackState,
  SelectionState,
  UseVideoEditorReturn
} from '@/lib/hooks/use-video-editor'

// Re-export hook
export { useVideoEditor } from '@/lib/hooks/use-video-editor'

// Re-export FFmpeg browser functions
export {
  loadFFmpeg,
  isFFmpegLoaded,
  getVideoMetadata,
  generateThumbnail,
  generateWaveform,
  trimVideo,
  mergeVideos,
  applyFilter,
  applyFilters,
  changeSpeed,
  reverseVideo,
  cropVideo,
  rotateVideo,
  resizeVideo,
  addTextOverlay,
  addWatermark,
  extractAudio,
  replaceAudio,
  mixAudio,
  createGif,
  exportVideo,
  formatFileSize,
  formatDuration
} from '@/lib/video/ffmpeg-browser'
