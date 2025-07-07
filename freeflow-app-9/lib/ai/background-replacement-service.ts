import '@tensorflow/tfjs-backend-webgl'
import * as bodyPix from '@tensorflow-models/body-pix'
import { toast } from '@/components/ui/use-toast'

export class BackgroundReplacementService {
  private model: bodyPix.BodyPix | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private backgroundImage: HTMLImageElement | null = null
  private virtualBackground: string | null = null
  private isProcessing = false
  private requestAnimationFrameId: number | null = null

  async initialize() {
    if (this.model) return

    try {
      this.model = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      })

      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    } catch (error) {
      console.error('Failed to initialize background replacement:', error)
      toast({
        title: 'Error',
        description: 'Failed to initialize background replacement. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async setVirtualBackground(backgroundUrl: string | null) {
    this.virtualBackground = backgroundUrl

    if (backgroundUrl) {
      this.backgroundImage = new Image()
      this.backgroundImage.src = backgroundUrl
      await new Promise((resolve, reject) => {
        this.backgroundImage!.onload = resolve
        this.backgroundImage!.onerror = reject
      })
    } else {
      this.backgroundImage = null
    }
  }

  async processFrame(
    inputCanvas: HTMLCanvasElement,
    width: number,
    height: number
  ): Promise<ImageData | null> {
    if (!this.model || !this.canvas || !this.ctx || this.isProcessing) {
      return null
    }

    this.isProcessing = true

    try {
      // Set canvas dimensions
      this.canvas.width = width
      this.canvas.height = height

      // Get segmentation mask
      const segmentation = await this.model.segmentPerson(inputCanvas, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: 0.7
      })

      // Draw original frame
      this.ctx.drawImage(inputCanvas, 0, 0, width, height)

      // Get frame data
      const frame = this.ctx.getImageData(0, 0, width, height)

      // Apply background replacement
      if (this.backgroundImage) {
        // Draw background image
        this.ctx.drawImage(this.backgroundImage, 0, 0, width, height)

        // Get background data
        const backgroundData = this.ctx.getImageData(0, 0, width, height)

        // Blend person with background
        for (let i = 0; i < frame.data.length; i += 4) {
          const pixelIndex = Math.floor(i / 4)
          if (segmentation.data[pixelIndex] === 1) {
            // Person pixel - keep original
            backgroundData.data[i] = frame.data[i]
            backgroundData.data[i + 1] = frame.data[i + 1]
            backgroundData.data[i + 2] = frame.data[i + 2]
            backgroundData.data[i + 3] = frame.data[i + 3]
          }
        }

        this.isProcessing = false
        return backgroundData
      } else {
        // Blur background
        const blurredFrame = await this.blurBackground(frame, segmentation)
        this.isProcessing = false
        return blurredFrame
      }
    } catch (error) {
      console.error('Failed to process frame:', error)
      this.isProcessing = false
      return null
    }
  }

  private async blurBackground(
    frame: ImageData,
    segmentation: bodyPix.SemanticPersonSegmentation
  ): Promise<ImageData> {
    const blurredFrame = new ImageData(
      new Uint8ClampedArray(frame.data),
      frame.width,
      frame.height
    )

    // Apply Gaussian blur to background pixels
    const radius = 10
    const kernel = this.generateGaussianKernel(radius)

    for (let y = 0; y < frame.height; y++) {
      for (let x = 0; x < frame.width; x++) {
        const pixelIndex = y * frame.width + x

        // Only blur background pixels
        if (segmentation.data[pixelIndex] === 0) {
          let r = 0, g = 0, b = 0, a = 0, weight = 0

          // Apply kernel
          for (let ky = -radius; ky <= radius; ky++) {
            for (let kx = -radius; kx <= radius; kx++) {
              const px = Math.min(Math.max(x + kx, 0), frame.width - 1)
              const py = Math.min(Math.max(y + ky, 0), frame.height - 1)
              const i = (py * frame.width + px) * 4
              const w = kernel[ky + radius][kx + radius]

              r += frame.data[i] * w
              g += frame.data[i + 1] * w
              b += frame.data[i + 2] * w
              a += frame.data[i + 3] * w
              weight += w
            }
          }

          const i = (y * frame.width + x) * 4
          blurredFrame.data[i] = r / weight
          blurredFrame.data[i + 1] = g / weight
          blurredFrame.data[i + 2] = b / weight
          blurredFrame.data[i + 3] = a / weight
        }
      }
    }

    return blurredFrame
  }

  private generateGaussianKernel(radius: number): number[][] {
    const kernel: number[][] = []
    const sigma = radius / 3
    let sum = 0

    for (let y = -radius; y <= radius; y++) {
      const row: number[] = []
      for (let x = -radius; x <= radius; x++) {
        const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma))
        row.push(value)
        sum += value
      }
      kernel.push(row)
    }

    // Normalize kernel
    for (let y = 0; y < kernel.length; y++) {
      for (let x = 0; x < kernel[y].length; x++) {
        kernel[y][x] /= sum
      }
    }

    return kernel
  }

  cleanup() {
    if (this.requestAnimationFrameId !== null) {
      cancelAnimationFrame(this.requestAnimationFrameId)
    }
    this.model = null
    this.canvas = null
    this.ctx = null
    this.backgroundImage = null
    this.virtualBackground = null
    this.isProcessing = false
  }
} 