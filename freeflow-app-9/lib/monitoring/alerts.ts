/**
 * API Alerting System
 * Monitors metrics and triggers alerts for anomalies
 */

import { apiMetrics } from './metrics'

interface AlertRule {
    name: string
    condition: () => boolean
    severity: 'critical' | 'warning' | 'info'
    message: string
    cooldown: number // ms before same alert can fire again
    lastTriggered?: number
}

interface AlertChannel {
    type: 'slack' | 'email' | 'pagerduty' | 'webhook'
    config: Record<string, any>
}

class AlertingSystem {
    private rules: AlertRule[] = []
    private channels: AlertChannel[] = []
    private checkInterval?: NodeJS.Timeout

    constructor() {
        this.setupDefaultRules()
        this.startMonitoring()
    }

    /**
     * Setup default alert rules
     */
    private setupDefaultRules() {
        // High error rate alert
        this.addRule({
            name: 'high_error_rate',
            condition: () => {
                const metrics = apiMetrics.getSystemMetrics(300000) // Last 5 min
                return metrics.errorRate > 0.05 // >5% error rate
            },
            severity: 'critical',
            message: 'Error rate exceeded 5% threshold',
            cooldown: 300000, // 5 minutes
        })

        // Slow response time alert
        this.addRule({
            name: 'slow_response_time',
            condition: () => {
                const metrics = apiMetrics.getSystemMetrics(300000)
                return metrics.avgLatency > 2000 // >2s average
            },
            severity: 'warning',
            message: 'Average response time exceeds 2 seconds',
            cooldown: 600000, // 10 minutes
        })

        // High request volume alert
        this.addRule({
            name: 'high_request_volume',
            condition: () => {
                const metrics = apiMetrics.getSystemMetrics(60000) // Last minute
                return metrics.requestsPerSecond > 100
            },
            severity: 'info',
            message: 'Request volume exceeds 100 requests/second',
            cooldown: 300000,
        })

        // Specific endpoint errors
        const criticalEndpoints = [
            '/api/v1/invoices',
            '/api/payments',
            '/api/auth/login',
        ]

        criticalEndpoints.forEach(endpoint => {
            this.addRule({
                name: `${endpoint}_errors`,
                condition: () => {
                    const metrics = apiMetrics.getEndpointMetrics(endpoint, 300000)
                    return metrics.errorRate > 0.1 // >10% errors
                },
                severity: 'critical',
                message: `High error rate on ${endpoint}`,
                cooldown: 300000,
            })
        })
    }

    /**
     * Add a custom alert rule
     */
    addRule(rule: AlertRule) {
        this.rules.push(rule)
    }

    /**
     * Add an alert channel
     */
    addChannel(channel: AlertChannel) {
        this.channels.push(channel)
    }

    /**
     * Start monitoring for alerts
     */
    private startMonitoring() {
        const CHECK_INTERVAL = 60000 // Check every minute

        this.checkInterval = setInterval(() => {
            this.checkRules()
        }, CHECK_INTERVAL)
    }

    /**
     * Check all rules and trigger alerts
     */
    private async checkRules() {
        const now = Date.now()

        for (const rule of this.rules) {
            // Check cooldown
            if (rule.lastTriggered && now - rule.lastTriggered < rule.cooldown) {
                continue
            }

            // Check condition
            try {
                if (rule.condition()) {
                    await this.triggerAlert(rule)
                    rule.lastTriggered = now
                }
            } catch (error) {
                console.error(`Error checking rule ${rule.name}:`, error)
            }
        }
    }

    /**
     * Trigger an alert
     */
    private async triggerAlert(rule: AlertRule) {
        const alert = {
            name: rule.name,
            severity: rule.severity,
            message: rule.message,
            timestamp: new Date().toISOString(),
            metrics: apiMetrics.exportMetrics(),
        }

        console.log(`🚨 ALERT [${rule.severity.toUpperCase()}]: ${rule.message}`)

        // Send to all configured channels
        await Promise.allSettled(
            this.channels.map(channel => this.sendAlert(channel, alert))
        )
    }

    /**
     * Send alert to a specific channel
     */
    private async sendAlert(channel: AlertChannel, alert: any) {
        switch (channel.type) {
            case 'slack':
                return this.sendSlackAlert(channel.config, alert)

            case 'email':
                return this.sendEmailAlert(channel.config, alert)

            case 'pagerduty':
                return this.sendPagerDutyAlert(channel.config, alert)

            case 'webhook':
                return this.sendWebhookAlert(channel.config, alert)
        }
    }

    /**
     * Send Slack alert
     */
    private async sendSlackAlert(config: any, alert: any) {
        const webhook = config.webhookUrl
        const color = {
            critical: '#FF0000',
            warning: '#FFA500',
            info: '#0000FF',
        }[alert.severity]

        const payload = {
            text: `API Alert: ${alert.name}`,
            attachments: [
                {
                    color,
                    title: alert.severity.toUpperCase(),
                    text: alert.message,
                    fields: [
                        {
                            title: 'Timestamp',
                            value: alert.timestamp,
                            short: true,
                        },
                    ],
                },
            ],
        }

        await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
    }

    /**
     * Send email alert
     */
    private async sendEmailAlert(config: any, alert: any) {
        // Implement email sending via your email service
        console.log('Sending email alert:', alert)
    }

    /**
     * Send PagerDuty alert
     */
    private async sendPagerDutyAlert(config: any, alert: any) {
        const apiKey = config.apiKey
        const serviceKey = config.serviceKey

        const payload = {
            routing_key: serviceKey,
            event_action: 'trigger',
            payload: {
                summary: alert.message,
                severity: alert.severity,
                source: 'KAZI API',
                timestamp: alert.timestamp,
            },
        }

        await fetch('https://events.pagerduty.com/v2/enqueue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${apiKey}`,
            },
            body: JSON.stringify(payload),
        })
    }

    /**
     * Send webhook alert
     */
    private async sendWebhookAlert(config: any, alert: any) {
        await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
            body: JSON.stringify(alert),
        })
    }

    /**
     * Cleanup on shutdown
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval)
        }
    }
}

// Singleton instance
export const alerting = new AlertingSystem()

// Configure alert channels
if (process.env.SLACK_WEBHOOK_URL) {
    alerting.addChannel({
        type: 'slack',
        config: { webhookUrl: process.env.SLACK_WEBHOOK_URL },
    })
}

if (process.env.PAGERDUTY_API_KEY) {
    alerting.addChannel({
        type: 'pagerduty',
        config: {
            apiKey: process.env.PAGERDUTY_API_KEY,
            serviceKey: process.env.PAGERDUTY_SERVICE_KEY,
        },
    })
}
