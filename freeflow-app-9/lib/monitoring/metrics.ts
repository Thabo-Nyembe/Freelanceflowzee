/**
 * API Metrics Collection
 * Tracks request counts, latencies, and error rates for all endpoints
 */

interface MetricData {
    endpoint: string
    method: string
    statusCode: number
    duration: number
    userId?: string
    timestamp: number
}

class APIMetrics {
    private metrics: MetricData[] = []
    private readonly FLUSH_INTERVAL = 60000 // 1 minute
    private flushTimer?: NodeJS.Timeout

    constructor() {
        this.setupFlushTimer()
    }

    /**
     * Record an API request metric
     */
    record(data: Omit<MetricData, 'timestamp'>) {
        this.metrics.push({
            ...data,
            timestamp: Date.now(),
        })
    }

    /**
     * Get metrics for a specific endpoint
     */
    getEndpointMetrics(endpoint: string, timeWindow: number = 3600000) {
        const now = Date.now()
        const relevant = this.metrics.filter(
            m => m.endpoint === endpoint && now - m.timestamp < timeWindow
        )

        return {
            totalRequests: relevant.length,
            successRate: relevant.filter(m => m.statusCode < 400).length / relevant.length,
            errorRate: relevant.filter(m => m.statusCode >= 400).length / relevant.length,
            avgLatency: relevant.reduce((sum, m) => sum + m.duration, 0) / relevant.length,
            p95Latency: this.calculatePercentile(relevant.map(m => m.duration), 95),
            p99Latency: this.calculatePercentile(relevant.map(m => m.duration), 99),
        }
    }

    /**
     * Get overall system metrics
     */
    getSystemMetrics(timeWindow: number = 3600000) {
        const now = Date.now()
        const relevant = this.metrics.filter(m => now - m.timestamp < timeWindow)

        const statusCodes = relevant.reduce((acc, m) => {
            acc[m.statusCode] = (acc[m.statusCode] || 0) + 1
            return acc
        }, {} as Record<number, number>)

        return {
            totalRequests: relevant.length,
            requestsPerSecond: relevant.length / (timeWindow / 1000),
            statusCodes,
            errorRate: relevant.filter(m => m.statusCode >= 400).length / relevant.length,
            avgLatency: relevant.reduce((sum, m) => sum + m.duration, 0) / relevant.length,
        }
    }

    /**
     * Get metrics by HTTP method
     */
    getMethodMetrics(timeWindow: number = 3600000) {
        const now = Date.now()
        const relevant = this.metrics.filter(m => now - m.timestamp < timeWindow)

        const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
        return methods.reduce((acc, method) => {
            const methodMetrics = relevant.filter(m => m.method === method)
            acc[method] = {
                count: methodMetrics.length,
                avgLatency: methodMetrics.reduce((sum, m) => sum + m.duration, 0) / methodMetrics.length || 0,
                errorRate: methodMetrics.filter(m => m.statusCode >= 400).length / methodMetrics.length || 0,
            }
            return acc
        }, {} as Record<string, any>)
    }

    /**
     * Export metrics for external monitoring services
     */
    exportMetrics(format: 'prometheus' | 'datadog' | 'json' = 'json') {
        const systemMetrics = this.getSystemMetrics()
        const methodMetrics = this.getMethodMetrics()

        switch (format) {
            case 'prometheus':
                return this.toPrometheusFormat(systemMetrics, methodMetrics)
            case 'datadog':
                return this.toDatadogFormat(systemMetrics, methodMetrics)
            default:
                return { system: systemMetrics, methods: methodMetrics }
        }
    }

    /**
     * Setup automatic flushing of old metrics
     */
    private setupFlushTimer() {
        this.flushTimer = setInterval(() => {
            const cutoff = Date.now() - 3600000 // Keep last hour
            this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
        }, this.FLUSH_INTERVAL)
    }

    /**
     * Calculate percentile latency
     */
    private calculatePercentile(values: number[], percentile: number): number {
        if (values.length === 0) return 0

        const sorted = values.sort((a, b) => a - b)
        const index = Math.ceil((percentile / 100) * sorted.length) - 1
        return sorted[index]
    }

    /**
     * Convert to Prometheus format
     */
    private toPrometheusFormat(systemMetrics: any, methodMetrics: any): string {
        let output = ''

        output += `# TYPE api_requests_total counter\n`
        output += `api_requests_total ${systemMetrics.totalRequests}\n\n`

        output += `# TYPE api_requests_per_second gauge\n`
        output += `api_requests_per_second ${systemMetrics.requestsPerSecond.toFixed(2)}\n\n`

        output += `# TYPE api_error_rate gauge\n`
        output += `api_error_rate ${systemMetrics.errorRate.toFixed(4)}\n\n`

        output += `# TYPE api_avg_latency_ms gauge\n`
        output += `api_avg_latency_ms ${systemMetrics.avgLatency.toFixed(2)}\n\n`

        return output
    }

    /**
     * Convert to DataDog format
     */
    private toDatadogFormat(systemMetrics: any, methodMetrics: any): object[] {
        const now = Math.floor(Date.now() / 1000)

        return [
            {
                metric: 'api.requests.total',
                points: [[now, systemMetrics.totalRequests]],
                type: 'count',
            },
            {
                metric: 'api.requests.rate',
                points: [[now, systemMetrics.requestsPerSecond]],
                type: 'gauge',
            },
            {
                metric: 'api.error.rate',
                points: [[now, systemMetrics.errorRate]],
                type: 'gauge',
            },
            {
                metric: 'api.latency.avg',
                points: [[now, systemMetrics.avgLatency]],
                type: 'gauge',
            },
        ]
    }

    /**
     * Cleanup on shutdown
     */
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer)
        }
    }
}

// Singleton instance
export const apiMetrics = new APIMetrics()

/**
 * Middleware helper to track API metrics
 */
export function trackAPIMetric(
    endpoint: string,
    method: string,
    statusCode: number,
    startTime: number,
    userId?: string
) {
    const duration = Date.now() - startTime

    apiMetrics.record({
        endpoint,
        method,
        statusCode,
        duration,
        userId,
    })
}

/**
 * Example usage in API routes:
 * 
 * export async function PATCH(request: NextRequest) {
 *   const startTime = Date.now()
 *   
 *   try {
 *     // ... your API logic
 *     
 *     trackAPIMetric('/api/v1/invoices', 'PATCH', 200, startTime, user.id)
 *     return NextResponse.json({ data })
 *     
 *   } catch (error) {
 *     trackAPIMetric('/api/v1/invoices', 'PATCH', 500, startTime, user?.id)
 *     return NextResponse.json({ error }, { status: 500 })
 *   }
 * }
 */
