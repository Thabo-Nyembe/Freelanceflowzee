/**
 * FFmpeg.wasm Browser Video Editor
 *
 * Complete browser-based video editing using FFmpeg compiled to WebAssembly.
 * Supports: trim, merge, filters, effects, transitions, audio mixing, export
 */

// Types for FFmpeg.wasm browser processing
export interface FFmpegProgress {
  ratio: number
  time: number
  speed: number
}

export interface VideoFile {
  id: string
  name: string
  file: File | Blob
  url: string
  duration: number
  width: number
  height: number
  fps: number
  codec: string
  audioCodec: string | null
  size: number
  thumbnail?: string
}

export interface AudioFile {
  id: string
  name: string
  file: File | Blob
  url: string
  duration: number
  sampleRate: number
  channels: number
  bitrate: number
  size: number
  waveform?: number[]
}

export interface TimelineClip {
  id: string
  type: 'video' | 'audio' | 'image' | 'text'
  sourceId: string
  trackIndex: number
  startTime: number      // Position on timeline (seconds)
  duration: number       // Duration on timeline
  inPoint: number        // Start point in source media
  outPoint: number       // End point in source media
  volume?: number        // 0-1
  opacity?: number       // 0-1
  filters?: VideoFilter[]
  transitions?: Transition[]
  position?: { x: number; y: number }
  scale?: { x: number; y: number }
  rotation?: number
}

export interface VideoFilter {
  id: string
  type: FilterType
  enabled: boolean
  params: Record<string, number | string | boolean>
}

export type FilterType =
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'hue'
  | 'blur'
  | 'sharpen'
  | 'grayscale'
  | 'sepia'
  | 'vignette'
  | 'colorBalance'
  | 'curves'
  | 'chromaKey'
  | 'noise'
  | 'denoise'
  | 'stabilize'
  | 'speed'
  | 'reverse'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'mirror'
  | 'text'
  | 'watermark'
  | 'pip'    // Picture in Picture
  | 'custom'

export interface Transition {
  id: string
  type: TransitionType
  duration: number
  position: 'start' | 'end'
  params?: Record<string, number | string>
}

export type TransitionType =
  | 'fade'
  | 'dissolve'
  | 'wipe'
  | 'slide'
  | 'zoom'
  | 'blur'
  | 'pixelate'
  | 'none'

export interface Track {
  id: string
  type: 'video' | 'audio'
  name: string
  muted: boolean
  locked: boolean
  visible: boolean
  volume: number
  clips: TimelineClip[]
}

export interface VideoProject {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  width: number
  height: number
  fps: number
  duration: number
  tracks: Track[]
  mediaPool: (VideoFile | AudioFile)[]
  settings: ProjectSettings
}

export interface ProjectSettings {
  outputFormat: 'mp4' | 'webm' | 'mov' | 'gif'
  quality: 'low' | 'medium' | 'high' | 'ultra'
  resolution: '720p' | '1080p' | '1440p' | '4k' | 'custom'
  customWidth?: number
  customHeight?: number
  fps: number
  audioCodec: 'aac' | 'mp3' | 'opus'
  audioBitrate: number
  videoCodec: 'h264' | 'h265' | 'vp9' | 'av1'
  videoBitrate?: number
  crf?: number
  preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow'
  twoPass?: boolean
}

export interface ExportResult {
  success: boolean
  blob?: Blob
  url?: string
  duration: number
  size: number
  format: string
  error?: string
}

// FFmpeg.wasm instance management
let ffmpegInstance: any = null
let isLoaded = false
let loadingPromise: Promise<void> | null = null

/**
 * Load FFmpeg.wasm with multi-threading support
 */
export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<void> {
  if (isLoaded) return

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    try {
      // Dynamic import for browser-only
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

      ffmpegInstance = new FFmpeg()

      // Set up progress logging
      ffmpegInstance.on('log', ({ message }: { message: string }) => {
        console.log('[FFmpeg]', message)
      })

      ffmpegInstance.on('progress', ({ progress }: { progress: number }) => {
        if (onProgress) {
          onProgress(progress)
        }
      })

      // Load FFmpeg with multi-threading if available
      const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'

      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      })

      isLoaded = true
      console.log('[FFmpeg.wasm] Loaded successfully with multi-threading')
    } catch (error) {
      // Fallback to single-threaded version
      console.warn('[FFmpeg.wasm] Multi-threaded load failed, falling back to single-threaded')
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { toBlobURL } = await import('@ffmpeg/util')

      ffmpegInstance = new FFmpeg()

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      isLoaded = true
      console.log('[FFmpeg.wasm] Loaded successfully (single-threaded)')
    }
  })()

  return loadingPromise
}

/**
 * Check if FFmpeg is loaded
 */
export function isFFmpegLoaded(): boolean {
  return isLoaded
}

/**
 * Get FFmpeg instance
 */
export function getFFmpegInstance(): any {
  if (!ffmpegInstance) {
    throw new Error('FFmpeg not loaded. Call loadFFmpeg() first.')
  }
  return ffmpegInstance
}

/**
 * Write file to FFmpeg virtual filesystem
 */
export async function writeFile(name: string, data: File | Blob | Uint8Array): Promise<void> {
  const ffmpeg = getFFmpegInstance()
  const { fetchFile } = await import('@ffmpeg/util')

  if (data instanceof File || data instanceof Blob) {
    await ffmpeg.writeFile(name, await fetchFile(data))
  } else {
    await ffmpeg.writeFile(name, data)
  }
}

/**
 * Read file from FFmpeg virtual filesystem
 */
export async function readFile(name: string): Promise<Uint8Array> {
  const ffmpeg = getFFmpegInstance()
  return ffmpeg.readFile(name)
}

/**
 * Delete file from FFmpeg virtual filesystem
 */
export async function deleteFile(name: string): Promise<void> {
  const ffmpeg = getFFmpegInstance()
  try {
    await ffmpeg.deleteFile(name)
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
 * Run FFmpeg command
 */
export async function runFFmpeg(args: string[]): Promise<void> {
  const ffmpeg = getFFmpegInstance()
  await ffmpeg.exec(args)
}

// ============================================================================
// Video Analysis Functions
// ============================================================================

/**
 * Get video metadata from file
 */
export async function getVideoMetadata(file: File | Blob): Promise<VideoFile> {
  const id = crypto.randomUUID()
  const name = file instanceof File ? file.name : `video_${id}`
  const url = URL.createObjectURL(file)

  // Get metadata using video element
  const metadata = await new Promise<{
    duration: number
    width: number
    height: number
  }>((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      })
      video.remove()
    }
    video.onerror = () => reject(new Error('Failed to load video metadata'))
    video.src = url
  })

  // Estimate FPS and codec (would need ffprobe for accurate values)
  const fps = 30 // Default estimate
  const codec = 'h264' // Default estimate
  const audioCodec = 'aac' // Default estimate

  return {
    id,
    name,
    file,
    url,
    duration: metadata.duration,
    width: metadata.width,
    height: metadata.height,
    fps,
    codec,
    audioCodec,
    size: file.size,
  }
}

/**
 * Generate video thumbnail at specific time
 */
export async function generateThumbnail(
  file: File | Blob,
  time: number = 0,
  width: number = 320
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    video.preload = 'auto'
    video.muted = true

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(time, video.duration)
    }

    video.onseeked = () => {
      const aspectRatio = video.videoWidth / video.videoHeight
      const height = width / aspectRatio

      canvas.width = width
      canvas.height = height

      ctx.drawImage(video, 0, 0, width, height)

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

      URL.revokeObjectURL(video.src)
      video.remove()
      canvas.remove()

      resolve(dataUrl)
    }

    video.onerror = () => reject(new Error('Failed to generate thumbnail'))
    video.src = URL.createObjectURL(file)
  })
}

/**
 * Generate video waveform for timeline
 */
export async function generateWaveform(
  file: File | Blob,
  samples: number = 100
): Promise<number[]> {
  // Use Web Audio API to extract audio waveform
  const audioContext = new AudioContext()
  const arrayBuffer = await file.arrayBuffer()

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const channelData = audioBuffer.getChannelData(0)
    const blockSize = Math.floor(channelData.length / samples)

    const waveform: number[] = []

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize
      const end = start + blockSize

      let sum = 0
      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j])
      }

      waveform.push(sum / blockSize)
    }

    // Normalize to 0-1
    const max = Math.max(...waveform)
    return waveform.map(v => v / max)
  } finally {
    audioContext.close()
  }
}

// ============================================================================
// Video Processing Functions
// ============================================================================

/**
 * Trim video to specified time range
 */
export async function trimVideo(
  file: File | Blob,
  startTime: number,
  endTime: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  const duration = endTime - startTime

  await runFFmpeg([
    '-ss', startTime.toString(),
    '-i', inputName,
    '-t', duration.toString(),
    '-c', 'copy',
    '-avoid_negative_ts', 'make_zero',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Merge multiple videos
 */
export async function mergeVideos(
  files: (File | Blob)[],
  options?: {
    transition?: TransitionType
    transitionDuration?: number
  },
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  // Write all input files
  const inputNames: string[] = []
  for (let i = 0; i < files.length; i++) {
    const name = `input${i}.mp4`
    await writeFile(name, files[i])
    inputNames.push(name)
  }

  const outputName = 'output.mp4'

  if (options?.transition && options.transition !== 'none') {
    // Use complex filter for transitions
    const filterParts: string[] = []
    let lastOutput = '[0:v]'

    for (let i = 1; i < inputNames.length; i++) {
      const output = i === inputNames.length - 1 ? '[v]' : `[v${i}]`
      const transitionFilter = getTransitionFilter(
        options.transition,
        options.transitionDuration || 0.5
      )
      filterParts.push(`${lastOutput}[${i}:v]${transitionFilter}${output}`)
      lastOutput = output
    }

    const inputArgs = inputNames.flatMap(name => ['-i', name])

    await runFFmpeg([
      ...inputArgs,
      '-filter_complex', filterParts.join(';'),
      '-map', '[v]',
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      outputName
    ])
  } else {
    // Use concat demuxer for simple concatenation
    const concatList = inputNames.map(name => `file '${name}'`).join('\n')
    await writeFile('list.txt', new TextEncoder().encode(concatList))

    await runFFmpeg([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'list.txt',
      '-c', 'copy',
      outputName
    ])

    await deleteFile('list.txt')
  }

  const data = await readFile(outputName)

  // Cleanup
  for (const name of inputNames) {
    await deleteFile(name)
  }
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Apply filter to video
 */
export async function applyFilter(
  file: File | Blob,
  filter: VideoFilter,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  const filterString = buildFilterString(filter)

  await runFFmpeg([
    '-i', inputName,
    '-vf', filterString,
    '-c:a', 'copy',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Apply multiple filters to video
 */
export async function applyFilters(
  file: File | Blob,
  filters: VideoFilter[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  const filterStrings = filters
    .filter(f => f.enabled)
    .map(buildFilterString)

  if (filterStrings.length === 0) {
    // No filters, just copy
    await runFFmpeg(['-i', inputName, '-c', 'copy', outputName])
  } else {
    await runFFmpeg([
      '-i', inputName,
      '-vf', filterStrings.join(','),
      '-c:a', 'copy',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      outputName
    ])
  }

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Change video speed
 */
export async function changeSpeed(
  file: File | Blob,
  speed: number,
  preservePitch: boolean = true,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  // PTS = Presentation Time Stamp
  const videoFilter = `setpts=${1/speed}*PTS`
  const audioFilter = preservePitch
    ? `atempo=${speed > 2 ? 2 : speed < 0.5 ? 0.5 : speed}`
    : `asetrate=44100*${speed},aresample=44100`

  // Handle extreme speed changes with multiple atempo filters
  let audioFilters = [audioFilter]
  if (speed > 2) {
    const remaining = speed / 2
    audioFilters = [`atempo=2`, `atempo=${remaining}`]
  } else if (speed < 0.5) {
    const remaining = speed / 0.5
    audioFilters = [`atempo=0.5`, `atempo=${remaining}`]
  }

  await runFFmpeg([
    '-i', inputName,
    '-filter_complex', `[0:v]${videoFilter}[v];[0:a]${audioFilters.join(',')}[a]`,
    '-map', '[v]',
    '-map', '[a]',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Reverse video
 */
export async function reverseVideo(
  file: File | Blob,
  includeAudio: boolean = true,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  if (includeAudio) {
    await runFFmpeg([
      '-i', inputName,
      '-vf', 'reverse',
      '-af', 'areverse',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      outputName
    ])
  } else {
    await runFFmpeg([
      '-i', inputName,
      '-vf', 'reverse',
      '-an',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      outputName
    ])
  }

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Crop video
 */
export async function cropVideo(
  file: File | Blob,
  crop: { x: number; y: number; width: number; height: number },
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  await runFFmpeg([
    '-i', inputName,
    '-vf', `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    '-c:a', 'copy',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Rotate video
 */
export async function rotateVideo(
  file: File | Blob,
  degrees: 90 | 180 | 270,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  const transposeMap: Record<number, string> = {
    90: 'transpose=1',
    180: 'transpose=1,transpose=1',
    270: 'transpose=2'
  }

  await runFFmpeg([
    '-i', inputName,
    '-vf', transposeMap[degrees],
    '-c:a', 'copy',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Resize video
 */
export async function resizeVideo(
  file: File | Blob,
  width: number,
  height: number,
  maintainAspect: boolean = true,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  const scaleFilter = maintainAspect
    ? `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`
    : `scale=${width}:${height}`

  await runFFmpeg([
    '-i', inputName,
    '-vf', scaleFilter,
    '-c:a', 'copy',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Add text overlay to video
 */
export async function addTextOverlay(
  file: File | Blob,
  text: string,
  options: {
    x?: number | string
    y?: number | string
    fontSize?: number
    fontColor?: string
    fontFamily?: string
    startTime?: number
    endTime?: number
    animation?: 'none' | 'fade' | 'scroll'
  } = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  await writeFile(inputName, file)

  const {
    x = '(w-text_w)/2',
    y = 'h-50',
    fontSize = 24,
    fontColor = 'white',
    startTime,
    endTime,
    animation = 'none'
  } = options

  let drawText = `drawtext=text='${text.replace(/'/g, "\\'")}':fontsize=${fontSize}:fontcolor=${fontColor}:x=${x}:y=${y}`

  if (startTime !== undefined && endTime !== undefined) {
    drawText += `:enable='between(t,${startTime},${endTime})'`
  }

  if (animation === 'fade') {
    drawText += `:alpha='if(lt(t,1),t,if(lt(t,${endTime || 10}-1),1,${endTime || 10}-t))'`
  }

  await runFFmpeg([
    '-i', inputName,
    '-vf', drawText,
    '-c:a', 'copy',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Add watermark to video
 */
export async function addWatermark(
  videoFile: File | Blob,
  watermarkFile: File | Blob,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right',
  opacity: number = 0.7,
  scale: number = 0.2,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const watermarkName = 'watermark.png'
  const outputName = 'output.mp4'

  await writeFile(inputName, videoFile)
  await writeFile(watermarkName, watermarkFile)

  const positionMap: Record<string, string> = {
    'top-left': 'x=10:y=10',
    'top-right': 'x=W-w-10:y=10',
    'bottom-left': 'x=10:y=H-h-10',
    'bottom-right': 'x=W-w-10:y=H-h-10',
    'center': 'x=(W-w)/2:y=(H-h)/2'
  }

  await runFFmpeg([
    '-i', inputName,
    '-i', watermarkName,
    '-filter_complex',
    `[1:v]scale=iw*${scale}:-1,format=rgba,colorchannelmixer=aa=${opacity}[wm];[0:v][wm]overlay=${positionMap[position]}`,
    '-c:a', 'copy',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(watermarkName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Extract audio from video
 */
export async function extractAudio(
  file: File | Blob,
  format: 'mp3' | 'aac' | 'wav' | 'flac' = 'mp3',
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const outputName = `output.${format}`

  await writeFile(inputName, file)

  const codecMap: Record<string, string> = {
    mp3: 'libmp3lame',
    aac: 'aac',
    wav: 'pcm_s16le',
    flac: 'flac'
  }

  await runFFmpeg([
    '-i', inputName,
    '-vn',
    '-acodec', codecMap[format],
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(outputName)

  const mimeMap: Record<string, string> = {
    mp3: 'audio/mp3',
    aac: 'audio/aac',
    wav: 'audio/wav',
    flac: 'audio/flac'
  }

  return new Blob([data], { type: mimeMap[format] })
}

/**
 * Replace audio in video
 */
export async function replaceAudio(
  videoFile: File | Blob,
  audioFile: File | Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const videoName = 'video.mp4'
  const audioName = 'audio.mp3'
  const outputName = 'output.mp4'

  await writeFile(videoName, videoFile)
  await writeFile(audioName, audioFile)

  await runFFmpeg([
    '-i', videoName,
    '-i', audioName,
    '-c:v', 'copy',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(videoName)
  await deleteFile(audioName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Mix audio tracks
 */
export async function mixAudio(
  videoFile: File | Blob,
  audioFile: File | Blob,
  options: {
    videoVolume?: number
    audioVolume?: number
    audioStartTime?: number
  } = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const videoName = 'video.mp4'
  const audioName = 'audio.mp3'
  const outputName = 'output.mp4'

  await writeFile(videoName, videoFile)
  await writeFile(audioName, audioFile)

  const { videoVolume = 1, audioVolume = 0.5, audioStartTime = 0 } = options

  await runFFmpeg([
    '-i', videoName,
    '-i', audioName,
    '-filter_complex',
    `[0:a]volume=${videoVolume}[a1];[1:a]adelay=${audioStartTime * 1000}|${audioStartTime * 1000},volume=${audioVolume}[a2];[a1][a2]amix=inputs=2:duration=first`,
    '-c:v', 'copy',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(videoName)
  await deleteFile(audioName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'video/mp4' })
}

/**
 * Create GIF from video
 */
export async function createGif(
  file: File | Blob,
  options: {
    startTime?: number
    duration?: number
    width?: number
    fps?: number
  } = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  await loadFFmpeg(onProgress)

  const inputName = 'input.mp4'
  const paletteName = 'palette.png'
  const outputName = 'output.gif'

  await writeFile(inputName, file)

  const { startTime = 0, duration = 5, width = 480, fps = 10 } = options

  // Generate palette for better GIF quality
  await runFFmpeg([
    '-ss', startTime.toString(),
    '-t', duration.toString(),
    '-i', inputName,
    '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
    '-y',
    paletteName
  ])

  // Create GIF using palette
  await runFFmpeg([
    '-ss', startTime.toString(),
    '-t', duration.toString(),
    '-i', inputName,
    '-i', paletteName,
    '-lavfi', `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
    '-y',
    outputName
  ])

  const data = await readFile(outputName)

  await deleteFile(inputName)
  await deleteFile(paletteName)
  await deleteFile(outputName)

  return new Blob([data], { type: 'image/gif' })
}

/**
 * Export video with settings
 */
export async function exportVideo(
  file: File | Blob,
  settings: ProjectSettings,
  onProgress?: (progress: number) => void
): Promise<ExportResult> {
  const startTime = Date.now()

  try {
    await loadFFmpeg(onProgress)

    const inputName = 'input.mp4'
    const outputName = `output.${settings.outputFormat}`

    await writeFile(inputName, file)

    const args: string[] = ['-i', inputName]

    // Video codec
    const videoCodecMap: Record<string, string> = {
      h264: 'libx264',
      h265: 'libx265',
      vp9: 'libvpx-vp9',
      av1: 'libaom-av1'
    }
    args.push('-c:v', videoCodecMap[settings.videoCodec] || 'libx264')

    // Audio codec
    const audioCodecMap: Record<string, string> = {
      aac: 'aac',
      mp3: 'libmp3lame',
      opus: 'libopus'
    }
    args.push('-c:a', audioCodecMap[settings.audioCodec] || 'aac')

    // Resolution
    if (settings.resolution !== 'custom') {
      const resolutionMap: Record<string, string> = {
        '720p': '1280:720',
        '1080p': '1920:1080',
        '1440p': '2560:1440',
        '4k': '3840:2160'
      }
      args.push('-vf', `scale=${resolutionMap[settings.resolution]}:force_original_aspect_ratio=decrease,pad=${resolutionMap[settings.resolution].replace(':', ':')}:(ow-iw)/2:(oh-ih)/2`)
    } else if (settings.customWidth && settings.customHeight) {
      args.push('-vf', `scale=${settings.customWidth}:${settings.customHeight}`)
    }

    // FPS
    args.push('-r', settings.fps.toString())

    // Quality settings
    if (settings.crf !== undefined) {
      args.push('-crf', settings.crf.toString())
    } else {
      const crfMap: Record<string, number> = {
        low: 28,
        medium: 23,
        high: 18,
        ultra: 15
      }
      args.push('-crf', (crfMap[settings.quality] || 23).toString())
    }

    // Preset
    if (settings.preset) {
      args.push('-preset', settings.preset)
    }

    // Audio bitrate
    args.push('-b:a', `${settings.audioBitrate}k`)

    // Video bitrate (if specified)
    if (settings.videoBitrate) {
      args.push('-b:v', `${settings.videoBitrate}k`)
    }

    // Format-specific options
    if (settings.outputFormat === 'mp4') {
      args.push('-movflags', '+faststart')
    }

    args.push('-y', outputName)

    await runFFmpeg(args)

    const data = await readFile(outputName)
    const blob = new Blob([data], { type: `video/${settings.outputFormat}` })
    const url = URL.createObjectURL(blob)

    await deleteFile(inputName)
    await deleteFile(outputName)

    return {
      success: true,
      blob,
      url,
      duration: (Date.now() - startTime) / 1000,
      size: blob.size,
      format: settings.outputFormat
    }
  } catch (error) {
    return {
      success: false,
      duration: (Date.now() - startTime) / 1000,
      size: 0,
      format: settings.outputFormat,
      error: error instanceof Error ? error.message : 'Export failed'
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build FFmpeg filter string from VideoFilter
 */
function buildFilterString(filter: VideoFilter): string {
  switch (filter.type) {
    case 'brightness':
      return `eq=brightness=${filter.params.value || 0}`
    case 'contrast':
      return `eq=contrast=${filter.params.value || 1}`
    case 'saturation':
      return `eq=saturation=${filter.params.value || 1}`
    case 'hue':
      return `hue=h=${filter.params.value || 0}`
    case 'blur':
      return `boxblur=${filter.params.radius || 5}:${filter.params.radius || 5}`
    case 'sharpen':
      return `unsharp=5:5:${filter.params.amount || 1}:5:5:0`
    case 'grayscale':
      return 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3'
    case 'sepia':
      return 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131'
    case 'vignette':
      return `vignette=PI/${filter.params.intensity || 4}`
    case 'noise':
      return `noise=alls=${filter.params.amount || 10}:allf=t+u`
    case 'denoise':
      return 'nlmeans'
    case 'speed':
      return `setpts=${1 / (filter.params.speed as number || 1)}*PTS`
    case 'crop':
      return `crop=${filter.params.width}:${filter.params.height}:${filter.params.x}:${filter.params.y}`
    case 'rotate':
      return `rotate=${filter.params.angle || 0}*PI/180`
    case 'flip':
      return 'vflip'
    case 'mirror':
      return 'hflip'
    case 'custom':
      return filter.params.filter as string || ''
    default:
      return ''
  }
}

/**
 * Get FFmpeg filter for transition type
 */
function getTransitionFilter(type: TransitionType, duration: number): string {
  switch (type) {
    case 'fade':
      return `xfade=transition=fade:duration=${duration}`
    case 'dissolve':
      return `xfade=transition=dissolve:duration=${duration}`
    case 'wipe':
      return `xfade=transition=wipeleft:duration=${duration}`
    case 'slide':
      return `xfade=transition=slideleft:duration=${duration}`
    case 'zoom':
      return `xfade=transition=zoomin:duration=${duration}`
    case 'blur':
      return `xfade=transition=circleopen:duration=${duration}`
    case 'pixelate':
      return `xfade=transition=pixelize:duration=${duration}`
    default:
      return `xfade=transition=fade:duration=${duration}`
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default {
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
}
