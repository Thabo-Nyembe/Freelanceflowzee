export class VoiceEnhancementService {
  private audioContext: AudioContext | null = null
  private analyserNode: AnalyserNode | null = null
  private gainNode: GainNode | null = null
  private dynamicsNode: DynamicsCompressorNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private noiseReductionNode: ScriptProcessorNode | null = null
  private inputStream: MediaStreamAudioSourceNode | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as Record<string, unknown>).webkitAudioContext)()
    }
  }

  async setupAudioProcessing(stream: MediaStream): Promise<MediaStream> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available')
    }

    // Create audio nodes
    this.inputStream = this.audioContext.createMediaStreamSource(stream)
    this.analyserNode = this.audioContext.createAnalyser()
    this.gainNode = this.audioContext.createGain()
    this.dynamicsNode = this.audioContext.createDynamicsCompressor()
    this.filterNode = this.audioContext.createBiquadFilter()
    this.noiseReductionNode = this.audioContext.createScriptProcessor(2048, 1, 1)

    // Configure analyser
    this.analyserNode.fftSize = 2048
    this.analyserNode.smoothingTimeConstant = 0.8

    // Configure dynamics compressor
    this.dynamicsNode.threshold.value = -24
    this.dynamicsNode.knee.value = 30
    this.dynamicsNode.ratio.value = 12
    this.dynamicsNode.attack.value = 0.003
    this.dynamicsNode.release.value = 0.25

    // Configure filter
    this.filterNode.type = 'highpass'
    this.filterNode.frequency.value = 80
    this.filterNode.Q.value = 0.7

    // Configure noise reduction
    this.noiseReductionNode.onaudioprocess = this.handleNoiseReduction.bind(this)

    // Connect nodes
    this.inputStream
      .connect(this.filterNode)
      .connect(this.dynamicsNode)
      .connect(this.gainNode)
      .connect(this.noiseReductionNode)
      .connect(this.analyserNode)
      .connect(this.audioContext.destination)

    // Create enhanced output stream
    const enhancedStream = this.audioContext.createMediaStreamDestination()
    this.analyserNode.connect(enhancedStream)

    return enhancedStream.stream
  }

  private handleNoiseReduction(event: AudioProcessingEvent) {
    const inputBuffer = event.inputBuffer
    const outputBuffer = event.outputBuffer
    const inputData = inputBuffer.getChannelData(0)
    const outputData = outputBuffer.getChannelData(0)

    // Simple noise gate
    const noiseThreshold = 0.01
    for (let i = 0; i < inputData.length; i++) {
      // Apply noise gate
      if (Math.abs(inputData[i]) < noiseThreshold) {
        outputData[i] = 0
      } else {
        outputData[i] = inputData[i]
      }
    }
  }

  getAudioMetrics(): {
    volume: number
    noiseLevel: number
    clarity: number
  } {
    if (!this.analyserNode) {
      return { volume: 0, noiseLevel: 0, clarity: 0 }
    }

    const dataArray = new Float32Array(this.analyserNode.frequencyBinCount)
    this.analyserNode.getFloatFrequencyData(dataArray)

    // Calculate metrics
    const volume = this.calculateVolume(dataArray)
    const noiseLevel = this.calculateNoiseLevel(dataArray)
    const clarity = this.calculateClarity(dataArray)

    return { volume, noiseLevel, clarity }
  }

  private calculateVolume(data: Float32Array): number {
    const sum = data.reduce((acc, val) => acc + Math.abs(val), 0)
    return (sum / data.length) * 100
  }

  private calculateNoiseLevel(data: Float32Array): number {
    // Focus on high-frequency components (typically noise)
    const highFreqData = data.slice(Math.floor(data.length * 0.7))
    const sum = highFreqData.reduce((acc, val) => acc + Math.abs(val), 0)
    return (sum / highFreqData.length) * 100
  }

  private calculateClarity(data: Float32Array): number {
    // Focus on speech frequency range (300Hz - 3400Hz)
    const speechRange = data.slice(
      Math.floor(data.length * 0.1),
      Math.floor(data.length * 0.4)
    )
    const sum = speechRange.reduce((acc, val) => acc + Math.abs(val), 0)
    return (sum / speechRange.length) * 100
  }

  updateSettings(settings: {
    gainLevel?: number
    compressionRatio?: number
    noiseThreshold?: number
    filterFrequency?: number
  }) {
    if (this.gainNode && typeof settings.gainLevel === 'number') {
      this.gainNode.gain.value = settings.gainLevel
    }

    if (this.dynamicsNode && typeof settings.compressionRatio === 'number') {
      this.dynamicsNode.ratio.value = settings.compressionRatio
    }

    if (this.filterNode && typeof settings.filterFrequency === 'number') {
      this.filterNode.frequency.value = settings.filterFrequency
    }
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close()
    }
    this.inputStream?.disconnect()
    this.analyserNode?.disconnect()
    this.gainNode?.disconnect()
    this.dynamicsNode?.disconnect()
    this.filterNode?.disconnect()
    this.noiseReductionNode?.disconnect()
  }
} 