/**
 * Utility functions for safe localStorage operations
 */

export const safeLocalStorage = {
  /**
   * Safely set an item in localStorage with error handling
   */
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Failed to store item in localStorage (key: ${key}):`, error)
      
      // Try to clear some space if quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          // Clear old entries to make space
          safeLocalStorage.clearOldEntries()
          // Try again
          localStorage.setItem(key, value)
          return true
        } catch (retryError) {
          console.error('Failed to store item even after clearing space:', retryError)
        }
      }
      
      return false
    }
  },

  /**
   * Safely get an item from localStorage
   */
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`Failed to get item from localStorage (key: ${key}):`, error)
      return null
    }
  },

  /**
   * Safely remove an item from localStorage
   */
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove item from localStorage (key: ${key}):`, error)
      return false
    }
  },

  /**
   * Clear old entries to make space (removes items older than 7 days)
   */
  clearOldEntries: (): void => {
    try {
      const now = Date.now()
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (!key) continue
        
        try {
          const item = localStorage.getItem(key)
          if (!item) continue
          
          // Try to parse as JSON to check for timestamp
          const parsed = JSON.parse(item)
          if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
            localStorage.removeItem(key)
          }
        } catch {
          // If not JSON or no timestamp, check if key suggests it's old
          if (key.includes('temp_') || key.includes('cache_')) {
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear old localStorage entries:', error)
    }
  },

  /**
   * Get available storage space estimate
   */
  getStorageEstimate: async (): Promise<{ available: number; used: number } | null> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return {
          available: estimate.quota || 0,
          used: estimate.usage || 0
        }
      } catch (error) {
        console.warn('Failed to get storage estimate:', error)
      }
    }
    return null
  }
}

/**
 * Store data with automatic timestamp for cleanup
 */
export const storeWithTimestamp = (key: string, data: any): boolean => {
  const dataWithTimestamp = {
    ...data,
    timestamp: Date.now()
  }
  return safeLocalStorage.setItem(key, JSON.stringify(dataWithTimestamp))
}