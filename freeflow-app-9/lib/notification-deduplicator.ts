/**
 * Notification Deduplication Utility
 * 
 * Prevents duplicate notifications from spamming users by:
 * - Tracking notification signatures/hashes
 * - Implementing time-based cooldowns
 * - Managing notification frequency limits
 */

export interface NotificationSignature {
    title: string
    description?: string
    variant: string
    timestamp: number
}

interface DeduplicationEntry {
    signature: string
    count: number
    firstSeen: number
    lastSeen: number
}

class NotificationDeduplicator {
    private recentNotifications: Map<string, DeduplicationEntry> = new Map()
    private readonly cooldownMs: number
    private readonly maxDuplicates: number
    private readonly cleanupIntervalMs: number
    private cleanupInterval: NodeJS.Timeout | null = null

    constructor(
        cooldownMs: number = 5000, // 5 seconds default cooldown
        maxDuplicates: number = 3,  // Max 3 duplicates before suppression
        cleanupIntervalMs: number = 60000 // Clean up every minute
    ) {
        this.cooldownMs = cooldownMs
        this.maxDuplicates = maxDuplicates
        this.cleanupIntervalMs = cleanupIntervalMs
        this.startCleanup()
    }

    /**
     * Generate a unique signature for a notification
     */
    private generateSignature(notification: NotificationSignature): string {
        const { title, description, variant } = notification
        return `${variant}:${title}:${description || ''}`
    }

    /**
     * Check if a notification should be shown or suppressed
     * @returns true if notification should be shown, false if suppressed
     */
    shouldShow(notification: NotificationSignature): boolean {
        const signature = this.generateSignature(notification)
        const now = Date.now()
        const existing = this.recentNotifications.get(signature)

        // First time seeing this notification
        if (!existing) {
            this.recentNotifications.set(signature, {
                signature,
                count: 1,
                firstSeen: now,
                lastSeen: now
            })
            return true
        }

        // Check if cooldown period has passed
        const timeSinceLastSeen = now - existing.lastSeen
        if (timeSinceLastSeen > this.cooldownMs) {
            // Reset counter after cooldown
            existing.count = 1
            existing.firstSeen = now
            existing.lastSeen = now
            return true
        }

        // Within cooldown period - increment counter
        existing.count++
        existing.lastSeen = now

        // Suppress if we've hit the limit
        if (existing.count > this.maxDuplicates) {
            return false
        }

        return true
    }

    /**
     * Get the suppression count for a notification
     */
    getSuppressionCount(notification: NotificationSignature): number {
        const signature = this.generateSignature(notification)
        const existing = this.recentNotifications.get(signature)

        if (!existing || existing.count <= this.maxDuplicates) {
            return 0
        }

        return existing.count - this.maxDuplicates
    }

    /**
     * Clear a specific notification from the deduplication cache
     */
    clear(notification: NotificationSignature): void {
        const signature = this.generateSignature(notification)
        this.recentNotifications.delete(signature)
    }

    /**
     * Clear all notifications from the cache
     */
    clearAll(): void {
        this.recentNotifications.clear()
    }

    /**
     * Start periodic cleanup of old entries
     */
    private startCleanup(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanup()
        }, this.cleanupIntervalMs)
    }

    /**
     * Clean up old notification entries
     */
    private cleanup(): void {
        const now = Date.now()
        const entriesToDelete: string[] = []

        this.recentNotifications.forEach((entry, signature) => {
            // Remove entries older than cooldown period
            if (now - entry.lastSeen > this.cooldownMs * 2) {
                entriesToDelete.push(signature)
            }
        })

        entriesToDelete.forEach(sig => this.recentNotifications.delete(sig))
    }

    /**
     * Stop the cleanup interval
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
            this.cleanupInterval = null
        }
    }

    /**
     * Get current statistics
     */
    getStats(): {
        totalTracked: number
        suppressed: number
        active: number
    } {
        let suppressed = 0
        let active = 0

        this.recentNotifications.forEach(entry => {
            if (entry.count > this.maxDuplicates) {
                suppressed++
            } else {
                active++
            }
        })

        return {
            totalTracked: this.recentNotifications.size,
            suppressed,
            active
        }
    }
}

// Create singleton instance
export const notificationDeduplicator = new NotificationDeduplicator()

// Export class for custom instances
export { NotificationDeduplicator }
