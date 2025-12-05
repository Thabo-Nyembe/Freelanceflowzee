/**
 * Watermarking Library - Protect Digital Assets
 *
 * Features:
 * - Image watermarking with Sharp
 * - Text watermark overlay
 * - Logo watermark overlay
 * - Configurable position and opacity
 * - Batch processing
 * - Preview generation
 */

import sharp from 'sharp'

export interface WatermarkOptions {
  text?: string
  logoPath?: string
  position?:
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  opacity?: number // 0-1
  fontSize?: number
  fontColor?: string
  angle?: number // rotation in degrees
}

export interface WatermarkResult {
  buffer: Buffer
  width: number
  height: number
  format: string
  size: number
}

/**
 * Add text watermark to an image
 *
 * @param imageBuffer - Input image buffer
 * @param options - Watermark options
 * @returns Watermarked image buffer
 *
 * @example
 * ```typescript
 * const watermarked = await addTextWatermark(imageBuffer, {
 *   text: 'Kazi FreeFlow',
 *   position: 'bottom-right',
 *   opacity: 0.5
 * })
 * ```
 */
export async function addTextWatermark(
  imageBuffer: Buffer,
  options: WatermarkOptions = {}
): Promise<WatermarkResult> {
  const {
    text = process.env.WATERMARK_TEXT || 'Kazi FreeFlow',
    position = 'bottom-right',
    opacity = 0.5,
    fontSize = 48,
    fontColor = 'white',
    angle = -30
  } = options

  try {
    // Get image metadata
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: Missing dimensions')
    }

    const { width, height } = metadata

    // Create SVG text watermark
    const svgWidth = width
    const svgHeight = height

    // Calculate position
    let x = svgWidth / 2
    let y = svgHeight / 2
    let textAnchor = 'middle'

    switch (position) {
      case 'top-left':
        x = fontSize
        y = fontSize * 1.5
        textAnchor = 'start'
        break
      case 'top-right':
        x = svgWidth - fontSize
        y = fontSize * 1.5
        textAnchor = 'end'
        break
      case 'bottom-left':
        x = fontSize
        y = svgHeight - fontSize
        textAnchor = 'start'
        break
      case 'bottom-right':
        x = svgWidth - fontSize
        y = svgHeight - fontSize
        textAnchor = 'end'
        break
      case 'center':
      default:
        x = svgWidth / 2
        y = svgHeight / 2
        textAnchor = 'middle'
        break
    }

    // Create SVG watermark
    const svgWatermark = `
      <svg width="${svgWidth}" height="${svgHeight}">
        <text
          x="${x}"
          y="${y}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="${fontColor}"
          opacity="${opacity}"
          text-anchor="${textAnchor}"
          transform="rotate(${angle}, ${x}, ${y})"
        >
          ${text}
        </text>
      </svg>
    `

    // Composite watermark onto image
    const watermarkedBuffer = await image
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'center'
        }
      ])
      .toBuffer()

    const watermarkedMetadata = await sharp(watermarkedBuffer).metadata()

    return {
      buffer: watermarkedBuffer,
      width: watermarkedMetadata.width || width,
      height: watermarkedMetadata.height || height,
      format: watermarkedMetadata.format || 'jpeg',
      size: watermarkedBuffer.length
    }
  } catch (error: any) {
    throw new Error(`Watermarking failed: ${error.message}`)
  }
}

/**
 * Add logo watermark to an image
 *
 * @param imageBuffer - Input image buffer
 * @param logoBuffer - Logo image buffer
 * @param options - Watermark options
 * @returns Watermarked image buffer
 */
export async function addLogoWatermark(
  imageBuffer: Buffer,
  logoBuffer: Buffer,
  options: WatermarkOptions = {}
): Promise<WatermarkResult> {
  const { position = 'bottom-right', opacity = 0.5 } = options

  try {
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: Missing dimensions')
    }

    const { width, height } = metadata

    // Resize logo to 10% of image width
    const logoWidth = Math.floor(width * 0.1)
    const processedLogo = await sharp(logoBuffer)
      .resize(logoWidth)
      .ensureAlpha()
      .toBuffer()

    const logoMetadata = await sharp(processedLogo).metadata()
    const logoHeight = logoMetadata.height || logoWidth

    // Calculate position
    let gravity: any = 'southeast' // bottom-right
    let left = width - logoWidth - 20
    let top = height - logoHeight - 20

    switch (position) {
      case 'top-left':
        gravity = 'northwest'
        left = 20
        top = 20
        break
      case 'top-right':
        gravity = 'northeast'
        left = width - logoWidth - 20
        top = 20
        break
      case 'bottom-left':
        gravity = 'southwest'
        left = 20
        top = height - logoHeight - 20
        break
      case 'center':
        gravity = 'center'
        left = Math.floor((width - logoWidth) / 2)
        top = Math.floor((height - logoHeight) / 2)
        break
      case 'bottom-right':
      default:
        gravity = 'southeast'
        left = width - logoWidth - 20
        top = height - logoHeight - 20
        break
    }

    // Apply opacity to logo
    const transparentLogo = await sharp(processedLogo)
      .composite([
        {
          input: {
            create: {
              width: logoWidth,
              height: logoHeight,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: opacity }
            }
          },
          blend: 'dest-in'
        }
      ])
      .toBuffer()

    // Composite logo onto image
    const watermarkedBuffer = await image
      .composite([
        {
          input: transparentLogo,
          gravity,
          left,
          top
        }
      ])
      .toBuffer()

    const watermarkedMetadata = await sharp(watermarkedBuffer).metadata()

    return {
      buffer: watermarkedBuffer,
      width: watermarkedMetadata.width || width,
      height: watermarkedMetadata.height || height,
      format: watermarkedMetadata.format || 'jpeg',
      size: watermarkedBuffer.length
    }
  } catch (error: any) {
    throw new Error(`Logo watermarking failed: ${error.message}`)
  }
}

/**
 * Generate watermarked preview/thumbnail
 *
 * @param imageBuffer - Input image buffer
 * @param maxWidth - Maximum width for preview
 * @param options - Watermark options
 * @returns Watermarked preview buffer
 */
export async function generateWatermarkedPreview(
  imageBuffer: Buffer,
  maxWidth: number = 800,
  options: WatermarkOptions = {}
): Promise<WatermarkResult> {
  try {
    // Resize image first
    const resized = await sharp(imageBuffer)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer()

    // Add watermark
    const watermarked = await addTextWatermark(resized, {
      ...options,
      fontSize: Math.floor(maxWidth * 0.05), // 5% of width
      opacity: options.opacity || 0.7
    })

    return watermarked
  } catch (error: any) {
    throw new Error(`Preview generation failed: ${error.message}`)
  }
}

/**
 * Batch watermark multiple images
 *
 * @param images - Array of image buffers
 * @param options - Watermark options
 * @returns Array of watermarked image buffers
 */
export async function batchWatermark(
  images: Buffer[],
  options: WatermarkOptions = {}
): Promise<WatermarkResult[]> {
  const results: WatermarkResult[] = []

  for (const image of images) {
    try {
      const watermarked = await addTextWatermark(image, options)
      results.push(watermarked)
    } catch (error: any) {
      console.error('Batch watermark error:', error)
      // Continue with other images even if one fails
    }
  }

  return results
}

/**
 * Apply watermark pattern (repeated watermark across image)
 *
 * @param imageBuffer - Input image buffer
 * @param options - Watermark options
 * @returns Watermarked image buffer
 */
export async function addPatternWatermark(
  imageBuffer: Buffer,
  options: WatermarkOptions = {}
): Promise<WatermarkResult> {
  const {
    text = process.env.WATERMARK_TEXT || 'Kazi FreeFlow',
    opacity = 0.3,
    fontSize = 36,
    fontColor = 'white',
    angle = -30
  } = options

  try {
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: Missing dimensions')
    }

    const { width, height } = metadata

    // Calculate pattern spacing
    const spacingX = 300
    const spacingY = 200

    // Create multiple watermarks
    const watermarks: any[] = []

    for (let y = 0; y < height; y += spacingY) {
      for (let x = 0; x < width; x += spacingX) {
        const svgWatermark = `
          <svg width="${width}" height="${height}">
            <text
              x="${x}"
              y="${y}"
              font-family="Arial, sans-serif"
              font-size="${fontSize}"
              font-weight="bold"
              fill="${fontColor}"
              opacity="${opacity}"
              transform="rotate(${angle}, ${x}, ${y})"
            >
              ${text}
            </text>
          </svg>
        `

        watermarks.push({
          input: Buffer.from(svgWatermark),
          gravity: 'northwest'
        })
      }
    }

    // Apply all watermarks
    const watermarkedBuffer = await image.composite(watermarks).toBuffer()

    const watermarkedMetadata = await sharp(watermarkedBuffer).metadata()

    return {
      buffer: watermarkedBuffer,
      width: watermarkedMetadata.width || width,
      height: watermarkedMetadata.height || height,
      format: watermarkedMetadata.format || 'jpeg',
      size: watermarkedBuffer.length
    }
  } catch (error: any) {
    throw new Error(`Pattern watermarking failed: ${error.message}`)
  }
}

/**
 * Check if image is suitable for watermarking
 *
 * @param imageBuffer - Input image buffer
 * @returns True if image can be watermarked
 */
export async function canWatermark(imageBuffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(imageBuffer).metadata()

    // Check if image has valid dimensions
    if (!metadata.width || !metadata.height) {
      return false
    }

    // Check if image is large enough (minimum 200x200)
    if (metadata.width < 200 || metadata.height < 200) {
      return false
    }

    // Check if format is supported
    const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'tiff']
    if (!metadata.format || !supportedFormats.includes(metadata.format)) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * Remove watermark metadata (for testing/preview purposes)
 * NOTE: This doesn't actually remove visual watermarks, only metadata
 *
 * @param imageBuffer - Input image buffer
 * @returns Clean image buffer without metadata
 */
export async function stripMetadata(imageBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .withMetadata({
        // Remove EXIF and other metadata
        exif: {},
        icc: undefined
      })
      .toBuffer()
  } catch (error: any) {
    throw new Error(`Metadata stripping failed: ${error.message}`)
  }
}

/**
 * Get watermark configuration from environment
 */
export function getWatermarkConfig(): WatermarkOptions {
  return {
    text: process.env.WATERMARK_TEXT || 'Kazi FreeFlow',
    opacity: parseFloat(process.env.WATERMARK_OPACITY || '0.5'),
    fontSize: parseInt(process.env.WATERMARK_FONT_SIZE || '48'),
    fontColor: process.env.WATERMARK_COLOR || 'white',
    angle: parseInt(process.env.WATERMARK_ANGLE || '-30'),
    position:
      (process.env.WATERMARK_POSITION as any) || 'bottom-right'
  }
}
