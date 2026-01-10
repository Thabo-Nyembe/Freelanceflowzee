import { Comment, CommentPriority, CommentStatus } from '@/components/projects-hub/universal-pinpoint-feedback-system-enhanced'
import { AICommentAnalysis } from '@/lib/ai/comment-analysis-service'
import { ExportOptions } from '@/components/projects-hub/comment-export-system'
import { UPSProject, UPSUser, UPSNotification, UPSActivity } from '@/lib/ups/integration-service'

// API Configuration
interface APIConfig {
  baseURL: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  authToken?: string
  version: string
}

const defaultConfig: APIConfig = {
  baseURL: '/api/ups',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  version: 'v1'
}

// API Response Types
interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: string
    version: string
    requestId: string
  }
}

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface FilterParams {
  status?: CommentStatus[]
  priority?: CommentPriority[]
  assigneeId?: string[]
  authorId?: string[]
  projectId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  tags?: string[]
}

// Request/Response Interfaces
interface CreateCommentRequest {
  content: string
  position?: { x: number; y: number }
  priority: CommentPriority
  status?: CommentStatus
  assigneeId?: string
  tags?: string[]
  attachments?: File[]
  voiceNote?: Blob
  drawing?: any
  parentId?: string
  projectId: string
}

interface UpdateCommentRequest {
  content?: string
  priority?: CommentPriority
  status?: CommentStatus
  assigneeId?: string
  tags?: string[]
  resolved?: boolean
}

interface CreateProjectRequest {
  name: string
  description?: string
  settings: {
    allowAnonymousComments?: boolean
    requireApproval?: boolean
    emailNotifications?: boolean
    realTimeUpdates?: boolean
    aiAnalysisEnabled?: boolean
    exportFormats?: string[]
    maxFileSize?: number
    allowedFileTypes?: string[]
  }
}

interface InviteUserRequest {
  email: string
  role: 'viewer' | 'commenter' | 'editor' | 'admin'
  projectId: string
}

interface ExportRequest extends ExportOptions {
  projectId: string
  filters?: FilterParams
}

// Error Classes
export class UPSAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'UPSAPIError'
  }
}

export class UPSNetworkError extends UPSAPIError {
  constructor(message: string) {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'UPSNetworkError'
  }
}

export class UPSValidationError extends UPSAPIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'UPSValidationError'
  }
}

export class UPSAuthenticationError extends UPSAPIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'UPSAuthenticationError'
  }
}

export class UPSAuthorizationError extends UPSAPIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'UPSAuthorizationError'
  }
}

export class UPSNotFoundError extends UPSAPIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'UPSNotFoundError'
  }
}

export class UPSRateLimitError extends UPSAPIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'UPSRateLimitError'
  }
}

// Main API Service Class
export class UPSAPIService {
  private config: APIConfig
  private abortController?: AbortController

  constructor(config: Partial<APIConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // Configuration Methods
  setAuthToken(token: string): void {
    this.config.authToken = token
  }

  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL
  }

  updateConfig(updates: Partial<APIConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  // Core HTTP Methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}/${this.config.version}${endpoint}`

    // Create new abort controller for this request
    this.abortController = new AbortController()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-UPS-Version': this.config.version,
      ...options.headers
    }

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: this.abortController.signal
    }

    // Add timeout
    const timeoutId = setTimeout(() => {
      this.abortController?.abort()
    }, this.config.timeout)

    try {
      const response = await fetch(url, requestOptions)
      clearTimeout(timeoutId)

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      const result: APIResponse<T> = await response.json()

      if (!result.success && result.error) {
        throw new UPSAPIError(result.error, response.status)
      }

      return result
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle network errors
      if (error instanceof TypeError || error.name === 'AbortError') {
        if (retryCount < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * Math.pow(2, retryCount))
          return this.request<T>(endpoint, options, retryCount + 1)
        }
        throw new UPSNetworkError('Network request failed')
      }

      // Handle API errors
      if (error instanceof UPSAPIError) {
        throw error
      }

      // Handle unknown errors
      throw new UPSAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any

    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }

    const message = errorData.message || errorData.error || `HTTP ${response.status}`

    switch (response.status) {
      case 400:
        throw new UPSValidationError(message, errorData.details)
      case 401:
        throw new UPSAuthenticationError(message)
      case 403:
        throw new UPSAuthorizationError(message)
      case 404:
        throw new UPSNotFoundError(message)
      case 429:
        throw new UPSRateLimitError(message)
      default:
        throw new UPSAPIError(message, response.status, errorData.code)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    return searchParams.toString()
  }

  // Comment API Methods
  async getComments(
    projectId: string,
    filters: FilterParams = {},
    pagination: PaginationParams = {}
  ): Promise<APIResponse<Comment[]>> {
    const params = { projectId, ...filters, ...pagination }
    const queryString = this.buildQueryParams(params)
    return this.request<Comment[]>(`/comments?${queryString}`)
  }

  async getComment(id: string): Promise<APIResponse<Comment>> {
    return this.request<Comment>(`/comments/${id}`)
  }

  async createComment(data: CreateCommentRequest): Promise<APIResponse<Comment>> {
    // Handle file uploads
    if (data.attachments?.length || data.voiceNote || data.drawing) {
      return this.createCommentWithFiles(data)
    }

    return this.request<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  private async createCommentWithFiles(data: CreateCommentRequest): Promise<APIResponse<Comment>> {
    const formData = new FormData()

    // Add text data
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'attachments' && key !== 'voiceNote' && key !== 'drawing' && value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString())
      }
    })

    // Add files
    if (data.attachments?.length) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file)
      })
    }

    if (data.voiceNote) {
      formData.append('voiceNote', data.voiceNote, 'voice-note.webm')
    }

    if (data.drawing) {
      formData.append('drawing', JSON.stringify(data.drawing))
    }

    return this.request<Comment>('/comments', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData
    })
  }

  async updateComment(id: string, data: UpdateCommentRequest): Promise<APIResponse<Comment>> {
    return this.request<Comment>(`/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteComment(id: string): Promise<APIResponse<void>> {
    return this.request<void>(`/comments/${id}`, {
      method: 'DELETE'
    })
  }

  async resolveComment(id: string): Promise<APIResponse<Comment>> {
    return this.request<Comment>(`/comments/${id}/resolve`, {
      method: 'POST'
    })
  }

  async assignComment(id: string, assigneeId: string): Promise<APIResponse<Comment>> {
    return this.request<Comment>(`/comments/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId })
    })
  }

  // Project API Methods
  async getProjects(pagination: PaginationParams = {}): Promise<APIResponse<UPSProject[]>> {
    const queryString = this.buildQueryParams(pagination)
    return this.request<UPSProject[]>(`/projects?${queryString}`)
  }

  async getProject(id: string): Promise<APIResponse<UPSProject>> {
    return this.request<UPSProject>(`/projects/${id}`)
  }

  async createProject(data: CreateProjectRequest): Promise<APIResponse<UPSProject>> {
    return this.request<UPSProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProject(id: string, data: Partial<CreateProjectRequest>): Promise<APIResponse<UPSProject>> {
    return this.request<UPSProject>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteProject(id: string): Promise<APIResponse<void>> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE'
    })
  }

  // User API Methods
  async getUsers(projectId?: string): Promise<APIResponse<UPSUser[]>> {
    const params = projectId ? { projectId } : {}
    const queryString = this.buildQueryParams(params)
    return this.request<UPSUser[]>(`/users?${queryString}`)
  }

  async getUser(id: string): Promise<APIResponse<UPSUser>> {
    return this.request<UPSUser>(`/users/${id}`)
  }

  async inviteUser(data: InviteUserRequest): Promise<APIResponse<void>> {
    return this.request<void>('/users/invite', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async removeUser(projectId: string, userId: string): Promise<APIResponse<void>> {
    return this.request<void>(`/projects/${projectId}/users/${userId}`, {
      method: 'DELETE'
    })
  }

  async updateUserPresence(userId: string, isOnline: boolean): Promise<APIResponse<void>> {
    return this.request<void>(`/users/${userId}/presence`, {
      method: 'PATCH',
      body: JSON.stringify({ isOnline, lastSeen: new Date().toISOString() })
    })
  }

  // AI API Methods
  async analyzeComment(commentId: string): Promise<APIResponse<AICommentAnalysis>> {
    return this.request<AICommentAnalysis>(`/ai/analyze/${commentId}`, {
      method: 'POST'
    })
  }

  async getAIInsights(projectId: string): Promise<APIResponse<AICommentAnalysis[]>> {
    return this.request<AICommentAnalysis[]>(`/ai/insights/${projectId}`)
  }

  async generateSuggestions(commentId: string): Promise<APIResponse<string[]>> {
    return this.request<string[]>(`/ai/suggestions/${commentId}`, {
      method: 'POST'
    })
  }

  async bulkAnalyzeComments(projectId: string): Promise<APIResponse<AICommentAnalysis[]>> {
    return this.request<AICommentAnalysis[]>(`/ai/bulk-analyze/${projectId}`, {
      method: 'POST'
    })
  }

  // Export API Methods
  async exportComments(data: ExportRequest): Promise<APIResponse<{ exportId: string; downloadUrl: string }>> {
    return this.request<{ exportId: string; downloadUrl: string }>('/export', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getExportStatus(exportId: string): Promise<APIResponse<{ status: string; progress: number; downloadUrl?: string }>> {
    return this.request<{ status: string; progress: number; downloadUrl?: string }>(`/export/${exportId}/status`)
  }

  async getExportHistory(projectId: string): Promise<APIResponse<any[]>> {
    return this.request<any[]>(`/export/history/${projectId}`)
  }

  async downloadExport(exportId: string): Promise<Blob> {
    const response = await this.request<{ downloadUrl: string }>(`/export/${exportId}/download`)

    if (!response.data?.downloadUrl) {
      throw new UPSAPIError('Download URL not available')
    }

    const downloadResponse = await fetch(response.data.downloadUrl)
    if (!downloadResponse.ok) {
      throw new UPSAPIError('Failed to download export')
    }

    return downloadResponse.blob()
  }

  // Notification API Methods
  async getNotifications(userId: string, pagination: PaginationParams = {}): Promise<APIResponse<UPSNotification[]>> {
    const params = { userId, ...pagination }
    const queryString = this.buildQueryParams(params)
    return this.request<UPSNotification[]>(`/notifications?${queryString}`)
  }

  async markNotificationRead(id: string): Promise<APIResponse<void>> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'POST'
    })
  }

  async markAllNotificationsRead(userId: string): Promise<APIResponse<void>> {
    return this.request<void>(`/notifications/read-all`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    })
  }

  async clearNotifications(userId: string): Promise<APIResponse<void>> {
    return this.request<void>(`/notifications/clear`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    })
  }

  // Activity API Methods
  async getActivities(projectId: string, pagination: PaginationParams = {}): Promise<APIResponse<UPSActivity[]>> {
    const params = { projectId, ...pagination }
    const queryString = this.buildQueryParams(params)
    return this.request<UPSActivity[]>(`/activities?${queryString}`)
  }

  async logActivity(activity: Omit<UPSActivity, 'id' | 'timestamp'>): Promise<APIResponse<UPSActivity>> {
    return this.request<UPSActivity>('/activities', {
      method: 'POST',
      body: JSON.stringify({
        ...activity,
        timestamp: new Date().toISOString()
      })
    })
  }

  // Analytics API Methods
  async getProjectAnalytics(projectId: string, dateRange?: { from: string; to: string }): Promise<APIResponse<any>> {
    const params = { projectId, ...dateRange }
    const queryString = this.buildQueryParams(params)
    return this.request<any>(`/analytics/project?${queryString}`)
  }

  async getUserAnalytics(userId: string, dateRange?: { from: string; to: string }): Promise<APIResponse<any>> {
    const params = { userId, ...dateRange }
    const queryString = this.buildQueryParams(params)
    return this.request<any>(`/analytics/user?${queryString}`)
  }

  async getSystemMetrics(): Promise<APIResponse<any>> {
    return this.request<any>('/analytics/metrics')
  }

  // File API Methods
  async uploadFile(file: File, projectId: string): Promise<APIResponse<{ fileId: string; url: string }>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)

    return this.request<{ fileId: string; url: string }>('/files/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData
    })
  }

  async deleteFile(fileId: string): Promise<APIResponse<void>> {
    return this.request<void>(`/files/${fileId}`, {
      method: 'DELETE'
    })
  }

  // Search API Methods
  async searchComments(query: string, projectId: string, filters: FilterParams = {}): Promise<APIResponse<Comment[]>> {
    const params = { query, projectId, ...filters }
    const queryString = this.buildQueryParams(params)
    return this.request<Comment[]>(`/search/comments?${queryString}`)
  }

  async searchProjects(query: string): Promise<APIResponse<UPSProject[]>> {
    const queryString = this.buildQueryParams({ query })
    return this.request<UPSProject[]>(`/search/projects?${queryString}`)
  }

  // Real-time API Methods
  async getWebSocketToken(): Promise<APIResponse<{ token: string; endpoint: string }>> {
    return this.request<{ token: string; endpoint: string }>('/realtime/token')
  }

  // Health Check
  async healthCheck(): Promise<APIResponse<{ status: string; timestamp: string; version: string }>> {
    return this.request<{ status: string; timestamp: string; version: string }>('/health')
  }

  // Cleanup
  abort(): void {
    this.abortController?.abort()
  }

  destroy(): void {
    this.abort()
  }
}

// Singleton instance
let apiServiceInstance: UPSAPIService | null = null

export function getUPSAPIService(config?: Partial<APIConfig>): UPSAPIService {
  if (!apiServiceInstance) {
    apiServiceInstance = new UPSAPIService(config)
  } else if (config) {
    apiServiceInstance.updateConfig(config)
  }
  return apiServiceInstance
}

// Convenience functions
export const upsAPI = {
  comments: {
    list: (projectId: string, filters?: FilterParams, pagination?: PaginationParams) =>
      getUPSAPIService().getComments(projectId, filters, pagination),
    get: (id: string) => getUPSAPIService().getComment(id),
    create: (data: CreateCommentRequest) => getUPSAPIService().createComment(data),
    update: (id: string, data: UpdateCommentRequest) => getUPSAPIService().updateComment(id, data),
    delete: (id: string) => getUPSAPIService().deleteComment(id),
    resolve: (id: string) => getUPSAPIService().resolveComment(id),
    assign: (id: string, assigneeId: string) => getUPSAPIService().assignComment(id, assigneeId)
  },
  projects: {
    list: (pagination?: PaginationParams) => getUPSAPIService().getProjects(pagination),
    get: (id: string) => getUPSAPIService().getProject(id),
    create: (data: CreateProjectRequest) => getUPSAPIService().createProject(data),
    update: (id: string, data: Partial<CreateProjectRequest>) => getUPSAPIService().updateProject(id, data),
    delete: (id: string) => getUPSAPIService().deleteProject(id)
  },
  users: {
    list: (projectId?: string) => getUPSAPIService().getUsers(projectId),
    get: (id: string) => getUPSAPIService().getUser(id),
    invite: (data: InviteUserRequest) => getUPSAPIService().inviteUser(data),
    remove: (projectId: string, userId: string) => getUPSAPIService().removeUser(projectId, userId),
    updatePresence: (userId: string, isOnline: boolean) => getUPSAPIService().updateUserPresence(userId, isOnline)
  },
  ai: {
    analyze: (commentId: string) => getUPSAPIService().analyzeComment(commentId),
    insights: (projectId: string) => getUPSAPIService().getAIInsights(projectId),
    suggestions: (commentId: string) => getUPSAPIService().generateSuggestions(commentId),
    bulkAnalyze: (projectId: string) => getUPSAPIService().bulkAnalyzeComments(projectId)
  },
  export: {
    create: (data: ExportRequest) => getUPSAPIService().exportComments(data),
    status: (exportId: string) => getUPSAPIService().getExportStatus(exportId),
    history: (projectId: string) => getUPSAPIService().getExportHistory(projectId),
    download: (exportId: string) => getUPSAPIService().downloadExport(exportId)
  }
}

export default UPSAPIService