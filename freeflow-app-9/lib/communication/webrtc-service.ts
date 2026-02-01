import { EventEmitter } from 'events'

// WebRTC Configuration
export interface WebRTCConfig {
  iceServers: RTCIceServer[]
  sdpSemantics: 'unified-plan' | 'plan-b'
  bundlePolicy: 'balanced' | 'max-compat' | 'max-bundle'
  iceCandidatePoolSize: number
  enableDtlsSrtp: boolean
  debug: boolean
}

export interface MediaConstraints {
  audio: boolean | MediaTrackConstraints
  video: boolean | MediaTrackConstraints
  screen?: boolean
}

export interface CallQuality {
  audio: {
    bitrate: number
    packetsLost: number
    jitter: number
    roundTripTime: number
  }
  video: {
    bitrate: number
    packetsLost: number
    frameRate: number
    resolution: { width: number; height: number }
  }
  connection: {
    candidateType: string
    protocol: string
    localAddress: string
    remoteAddress: string
  }
}

export interface PeerConnection {
  id: string
  userId: string
  connection: RTCPeerConnection
  localStream?: MediaStream
  remoteStream?: MediaStream
  dataChannel?: RTCDataChannel
  isInitiator: boolean
  connectionState: RTCPeerConnectionState
  iceConnectionState: RTCIceConnectionState
  quality?: CallQuality
}

export interface ScreenShareOptions {
  audio: boolean
  video: boolean
  cursor: 'always' | 'motion' | 'never'
  displaySurface: 'application' | 'browser' | 'monitor' | 'window'
  logicalSurface: boolean
  suppressLocalAudioPlayback: boolean
}

// WebRTC Service
export class WebRTCService extends EventEmitter {
  private config: WebRTCConfig
  private peerConnections: Map<string, PeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private screenStream: MediaStream | null = null
  private currentCallId: string | null = null
  private isAudioEnabled = true
  private isVideoEnabled = true
  private isScreenSharing = false
  private mediaConstraints: MediaConstraints = { audio: true, video: true }

  constructor(config: Partial<WebRTCConfig> = {}) {
    super()
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      sdpSemantics: 'unified-plan',
      bundlePolicy: 'balanced',
      iceCandidatePoolSize: 10,
      enableDtlsSrtp: true,
      debug: false,
      ...config
    }

    this.setMaxListeners(100)
  }

  // Call Management
  async initiateCall(callId: string, participants: string[], mediaConstraints?: MediaConstraints): Promise<void> {
    this.currentCallId = callId
    if (mediaConstraints) {
      this.mediaConstraints = mediaConstraints
    }

    try {
      // Get local media
      await this.getLocalMedia()

      // Create peer connections for each participant
      for (const participantId of participants) {
        await this.createPeerConnection(participantId, true)
      }

      this.emit('callInitiated', { callId, participants })
      this.log('Call initiated:', callId)
    } catch (error) {
      this.emit('callError', { callId, error })
      throw error
    }
  }

  async joinCall(callId: string, participantId: string, mediaConstraints?: MediaConstraints): Promise<void> {
    this.currentCallId = callId
    if (mediaConstraints) {
      this.mediaConstraints = mediaConstraints
    }

    try {
      // Get local media
      await this.getLocalMedia()

      // Create peer connection
      await this.createPeerConnection(participantId, false)

      this.emit('callJoined', { callId, participantId })
      this.log('Joined call:', callId)
    } catch (error) {
      this.emit('callError', { callId, error })
      throw error
    }
  }

  async endCall(callId?: string): Promise<void> {
    const targetCallId = callId || this.currentCallId
    if (!targetCallId) return

    // Close all peer connections
    this.peerConnections.forEach((peer, peerId) => {
      this.closePeerConnection(peerId)
    })

    // Stop local streams
    this.stopLocalMedia()
    this.stopScreenShare()

    this.currentCallId = null
    this.emit('callEnded', { callId: targetCallId })
    this.log('Call ended:', targetCallId)
  }

  // Peer Connection Management
  private async createPeerConnection(userId: string, isInitiator: boolean): Promise<PeerConnection> {
    const connectionId = `${this.currentCallId}_${userId}`

    const rtcConfig: RTCConfiguration = {
      iceServers: this.config.iceServers,
      sdpSemantics: this.config.sdpSemantics,
      bundlePolicy: this.config.bundlePolicy,
      iceCandidatePoolSize: this.config.iceCandidatePoolSize
    }

    const connection = new RTCPeerConnection(rtcConfig)
    const peer: PeerConnection = {
      id: connectionId,
      userId,
      connection,
      isInitiator,
      connectionState: connection.connectionState,
      iceConnectionState: connection.iceConnectionState
    }

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        connection.addTrack(track, this.localStream!)
      })
    }

    // Set up event handlers
    this.setupPeerConnectionHandlers(peer)

    // Create data channel for initiator
    if (isInitiator) {
      peer.dataChannel = connection.createDataChannel('communication', {
        ordered: true
      })
      this.setupDataChannelHandlers(peer.dataChannel, userId)
    }

    this.peerConnections.set(connectionId, peer)

    // Start negotiation for initiator
    if (isInitiator) {
      await this.createOffer(peer)
    }

    return peer
  }

  private setupPeerConnectionHandlers(peer: PeerConnection): void {
    const { connection, userId } = peer

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('iceCandidate', {
          userId,
          candidate: event.candidate,
          callId: this.currentCallId
        })
      }
    }

    connection.ontrack = (event) => {
      peer.remoteStream = event.streams[0]
      this.emit('remoteStream', {
        userId,
        stream: event.streams[0],
        callId: this.currentCallId
      })
    }

    connection.ondatachannel = (event) => {
      const dataChannel = event.channel
      peer.dataChannel = dataChannel
      this.setupDataChannelHandlers(dataChannel, userId)
    }

    connection.onconnectionstatechange = () => {
      peer.connectionState = connection.connectionState
      this.emit('connectionStateChange', {
        userId,
        state: connection.connectionState,
        callId: this.currentCallId
      })

      if (connection.connectionState === 'failed') {
        this.handleConnectionFailure(peer)
      }
    }

    connection.oniceconnectionstatechange = () => {
      peer.iceConnectionState = connection.iceConnectionState
      this.emit('iceConnectionStateChange', {
        userId,
        state: connection.iceConnectionState,
        callId: this.currentCallId
      })
    }

    connection.onnegotiationneeded = async () => {
      if (peer.isInitiator && connection.signalingState === 'stable') {
        await this.createOffer(peer)
      }
    }

    // Quality monitoring
    setInterval(() => {
      this.updateCallQuality(peer)
    }, 5000)
  }

  private setupDataChannelHandlers(dataChannel: RTCDataChannel, userId: string): void {
    dataChannel.onopen = () => {
      this.emit('dataChannelOpen', { userId, callId: this.currentCallId })
    }

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.emit('dataChannelMessage', {
          userId,
          data,
          callId: this.currentCallId
        })
      } catch (error) {
        this.log('Error parsing data channel message:', error)
      }
    }

    dataChannel.onerror = (error) => {
      this.emit('dataChannelError', { userId, error, callId: this.currentCallId })
    }

    dataChannel.onclose = () => {
      this.emit('dataChannelClose', { userId, callId: this.currentCallId })
    }
  }

  private async createOffer(peer: PeerConnection): Promise<void> {
    try {
      const offer = await peer.connection.createOffer()
      await peer.connection.setLocalDescription(offer)

      this.emit('offer', {
        userId: peer.userId,
        offer,
        callId: this.currentCallId
      })
    } catch (error) {
      this.log('Error creating offer:', error)
      this.emit('signalError', { userId: peer.userId, error })
    }
  }

  private async createAnswer(peer: PeerConnection): Promise<void> {
    try {
      const answer = await peer.connection.createAnswer()
      await peer.connection.setLocalDescription(answer)

      this.emit('answer', {
        userId: peer.userId,
        answer,
        callId: this.currentCallId
      })
    } catch (error) {
      this.log('Error creating answer:', error)
      this.emit('signalError', { userId: peer.userId, error })
    }
  }

  // Signaling Handlers
  async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.findPeerByUserId(userId)
    if (!peer) {
      await this.createPeerConnection(userId, false)
      return this.handleOffer(userId, offer)
    }

    try {
      await peer.connection.setRemoteDescription(offer)
      await this.createAnswer(peer)
    } catch (error) {
      this.log('Error handling offer:', error)
      this.emit('signalError', { userId, error })
    }
  }

  async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.findPeerByUserId(userId)
    if (!peer) {
      this.log('No peer found for answer from:', userId)
      return
    }

    try {
      await peer.connection.setRemoteDescription(answer)
    } catch (error) {
      this.log('Error handling answer:', error)
      this.emit('signalError', { userId, error })
    }
  }

  async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.findPeerByUserId(userId)
    if (!peer) {
      this.log('No peer found for ICE candidate from:', userId)
      return
    }

    try {
      await peer.connection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      this.log('Error adding ICE candidate:', error)
    }
  }

  // Media Management
  private async getLocalMedia(): Promise<void> {
    if (this.localStream) return

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints)
      this.emit('localStream', { stream: this.localStream })
      this.log('Local media acquired')
    } catch (error) {
      this.log('Error getting local media:', error)
      this.emit('mediaError', { error })
      throw error
    }
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      this.isAudioEnabled = !this.isAudioEnabled
      audioTrack.enabled = this.isAudioEnabled

      this.emit('audioToggled', { enabled: this.isAudioEnabled })
      this.broadcastMediaState()
      return this.isAudioEnabled
    }

    return false
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      this.isVideoEnabled = !this.isVideoEnabled
      videoTrack.enabled = this.isVideoEnabled

      this.emit('videoToggled', { enabled: this.isVideoEnabled })
      this.broadcastMediaState()
      return this.isVideoEnabled
    }

    return false
  }

  async startScreenShare(options: Partial<ScreenShareOptions> = {}): Promise<MediaStream> {
    if (this.isScreenSharing) {
      throw new Error('Screen sharing already active')
    }

    const screenOptions: ScreenShareOptions = {
      audio: true,
      video: true,
      cursor: 'motion',
      displaySurface: 'monitor',
      logicalSurface: true,
      suppressLocalAudioPlayback: false,
      ...options
    }

    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: screenOptions.cursor,
          displaySurface: screenOptions.displaySurface,
          logicalSurface: screenOptions.logicalSurface
        },
        audio: {
          suppressLocalAudioPlayback: screenOptions.suppressLocalAudioPlayback
        }
      })

      // Replace video track in all peer connections
      const videoTrack = this.screenStream.getVideoTracks()[0]
      if (videoTrack) {
        this.peerConnections.forEach((peer) => {
          const sender = peer.connection.getSenders().find(s =>
            s.track && s.track.kind === 'video'
          )
          if (sender) {
            sender.replaceTrack(videoTrack)
          }
        })
      }

      // Handle screen share ending
      videoTrack.onended = () => {
        this.stopScreenShare()
      }

      this.isScreenSharing = true
      this.emit('screenShareStarted', { stream: this.screenStream })
      this.broadcastMediaState()

      return this.screenStream
    } catch (error) {
      this.log('Error starting screen share:', error)
      this.emit('screenShareError', { error })
      throw error
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.isScreenSharing || !this.screenStream) return

    // Stop screen stream
    this.screenStream.getTracks().forEach(track => track.stop())

    // Replace with camera video if available
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        this.peerConnections.forEach((peer) => {
          const sender = peer.connection.getSenders().find(s =>
            s.track && s.track.kind === 'video'
          )
          if (sender) {
            sender.replaceTrack(videoTrack)
          }
        })
      }
    }

    this.screenStream = null
    this.isScreenSharing = false
    this.emit('screenShareStopped')
    this.broadcastMediaState()
  }

  private stopLocalMedia(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
  }

  // Data Channel Communication
  sendDataChannelMessage(userId: string, data: any): boolean {
    const peer = this.findPeerByUserId(userId)
    if (!peer?.dataChannel || peer.dataChannel.readyState !== 'open') {
      return false
    }

    try {
      peer.dataChannel.send(JSON.stringify(data))
      return true
    } catch (error) {
      this.log('Error sending data channel message:', error)
      return false
    }
  }

  broadcastDataChannelMessage(data: any): void {
    this.peerConnections.forEach((peer) => {
      this.sendDataChannelMessage(peer.userId, data)
    })
  }

  private broadcastMediaState(): void {
    this.broadcastDataChannelMessage({
      type: 'mediaState',
      audio: this.isAudioEnabled,
      video: this.isVideoEnabled,
      screenSharing: this.isScreenSharing,
      timestamp: Date.now()
    })
  }

  // Quality Monitoring
  private async updateCallQuality(peer: PeerConnection): Promise<void> {
    try {
      const stats = await peer.connection.getStats()
      const quality: Partial<CallQuality> = {
        audio: { bitrate: 0, packetsLost: 0, jitter: 0, roundTripTime: 0 },
        video: { bitrate: 0, packetsLost: 0, frameRate: 0, resolution: { width: 0, height: 0 } }
      }

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp') {
          if (report.mediaType === 'audio') {
            quality.audio!.bitrate = report.bytesReceived * 8 / report.timestamp * 1000
            quality.audio!.packetsLost = report.packetsLost || 0
            quality.audio!.jitter = report.jitter || 0
          } else if (report.mediaType === 'video') {
            quality.video!.bitrate = report.bytesReceived * 8 / report.timestamp * 1000
            quality.video!.packetsLost = report.packetsLost || 0
            quality.video!.frameRate = report.framesPerSecond || 0
            quality.video!.resolution = {
              width: report.frameWidth || 0,
              height: report.frameHeight || 0
            }
          }
        } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          quality.connection = {
            candidateType: report.localCandidateType || '',
            protocol: report.protocol || '',
            localAddress: report.localAddress || '',
            remoteAddress: report.remoteAddress || '',
          }
          quality.audio!.roundTripTime = report.currentRoundTripTime || 0
        }
      })

      peer.quality = quality as CallQuality
      this.emit('qualityUpdate', {
        userId: peer.userId,
        quality: peer.quality,
        callId: this.currentCallId
      })
    } catch (error) {
      this.log('Error updating call quality:', error)
    }
  }

  // Connection Recovery
  private async handleConnectionFailure(peer: PeerConnection): Promise<void> {
    this.log('Connection failed for peer:', peer.userId)

    // Attempt ICE restart
    try {
      const offer = await peer.connection.createOffer({ iceRestart: true })
      await peer.connection.setLocalDescription(offer)

      this.emit('offer', {
        userId: peer.userId,
        offer,
        callId: this.currentCallId
      })

      this.emit('connectionRecoveryAttempt', {
        userId: peer.userId,
        callId: this.currentCallId
      })
    } catch (error) {
      this.log('Error during connection recovery:', error)
      this.emit('connectionRecoveryFailed', {
        userId: peer.userId,
        error,
        callId: this.currentCallId
      })
    }
  }

  // Utility Methods
  private findPeerByUserId(userId: string): PeerConnection | undefined {
    return Array.from(this.peerConnections.values())
      .find(peer => peer.userId === userId)
  }

  private closePeerConnection(connectionId: string): void {
    const peer = this.peerConnections.get(connectionId)
    if (peer) {
      peer.connection.close()
      if (peer.dataChannel) {
        peer.dataChannel.close()
      }
      this.peerConnections.delete(connectionId)
    }
  }

  // Getters
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getScreenStream(): MediaStream | null {
    return this.screenStream
  }

  getRemoteStreams(): Map<string, MediaStream> {
    const streams = new Map<string, MediaStream>()
    this.peerConnections.forEach((peer) => {
      if (peer.remoteStream) {
        streams.set(peer.userId, peer.remoteStream)
      }
    })
    return streams
  }

  getCallQuality(): Map<string, CallQuality> {
    const qualities = new Map<string, CallQuality>()
    this.peerConnections.forEach((peer) => {
      if (peer.quality) {
        qualities.set(peer.userId, peer.quality)
      }
    })
    return qualities
  }

  getConnectionStates(): Map<string, { connection: RTCPeerConnectionState; ice: RTCIceConnectionState }> {
    const states = new Map()
    this.peerConnections.forEach((peer) => {
      states.set(peer.userId, {
        connection: peer.connectionState,
        ice: peer.iceConnectionState
      })
    })
    return states
  }

  isAudioMuted(): boolean {
    return !this.isAudioEnabled
  }

  isVideoMuted(): boolean {
    return !this.isVideoEnabled
  }

  isScreenSharingActive(): boolean {
    return this.isScreenSharing
  }

  getCurrentCallId(): string | null {
    return this.currentCallId
  }

  getParticipants(): string[] {
    return Array.from(this.peerConnections.values()).map(peer => peer.userId)
  }

  // Configuration
  updateConfig(config: Partial<WebRTCConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Logging
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[WebRTC]', ...args)
    }
  }

  // Cleanup
  destroy(): void {
    this.endCall()
    this.removeAllListeners()
    this.peerConnections.clear()
  }
}

// Singleton instance
let webrtcServiceInstance: WebRTCService | null = null

export function getWebRTCService(config?: Partial<WebRTCConfig>): WebRTCService {
  if (!webrtcServiceInstance) {
    webrtcServiceInstance = new WebRTCService(config)
  } else if (config) {
    webrtcServiceInstance.updateConfig(config)
  }
  return webrtcServiceInstance
}

export default WebRTCService