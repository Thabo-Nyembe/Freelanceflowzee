import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('SlackIntegration')

// ============================================================================
// TYPES
// ============================================================================

export interface SlackConfig {
  token: string
  webhook?: string
  teamId: string
  defaultChannel: string
}

export interface SlackMessage {
  channel: string
  text?: string
  blocks?: SlackBlock[]
  attachments?: SlackAttachment[]
  thread_ts?: string
  reply_broadcast?: boolean
}

export interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
  }
  fields?: Array<{
    type: string
    text: string
  }>
  accessory?: any
  elements?: any[]
}

export interface SlackAttachment {
  color?: string
  fallback: string
  title?: string
  title_link?: string
  text?: string
  fields?: Array<{
    title: string
    value: string
    short?: boolean
  }>
  actions?: any[]
  footer?: string
  ts?: number
}

export interface Project {
  id: string
  name: string
  status: string
  progress: number
  nextMilestone?: string
  client?: {
    name: string
    email: string
  }
  timeline?: {
    startDate: string
    endDate: string
  }
}

export interface Milestone {
  id: string
  name: string
  projectName: string
  completedAt: string
  deliverables: string[]
}

export interface Payment {
  id: string
  amount: number
  client: string
  project: string
  receivedAt: string
  method: string
}

export interface Deliverable {
  id: string
  name: string
  projectName: string
  approvedAt: string
  client: string
  files: Array<{
    name: string
    url: string
  }>
}

// ============================================================================
// SLACK INTEGRATION CLASS
// ============================================================================

export class SlackIntegration {
  private token: string
  private webhook?: string
  private defaultChannel: string

  constructor(config: SlackConfig) {
    this.token = config.token
    this.webhook = config.webhook
    this.defaultChannel = config.defaultChannel

    logger.info('Slack integration initialized', {
      teamId: config.teamId,
      hasWebhook: !!config.webhook
    })
  }

  /**
   * Send a message to a Slack channel
   */
  async sendMessage(message: SlackMessage): Promise<boolean> {
    try {
      logger.info('Sending Slack message', {
        channel: message.channel,
        hasBlocks: !!message.blocks,
        hasAttachments: !!message.attachments
      })

      // Use webhook if available (simpler, no auth required)
      if (this.webhook && message.channel === this.defaultChannel) {
        return await this.sendWebhookMessage(message)
      }

      // Otherwise use API with token
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: message.channel,
          text: message.text,
          blocks: message.blocks,
          attachments: message.attachments,
          thread_ts: message.thread_ts,
          reply_broadcast: message.reply_broadcast
        })
      })

      const data = await response.json()

      if (!data.ok) {
        logger.error('Failed to send Slack message', {
          error: data.error,
          channel: message.channel
        })
        return false
      }

      logger.info('Slack message sent successfully', {
        channel: message.channel,
        ts: data.ts
      })

      return true
    } catch (error) {
      logger.error('Error sending Slack message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        channel: message.channel
      })
      return false
    }
  }

  /**
   * Send message via incoming webhook
   */
  private async sendWebhookMessage(message: SlackMessage): Promise<boolean> {
    if (!this.webhook) return false

    try {
      const response = await fetch(this.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: message.text,
          blocks: message.blocks,
          attachments: message.attachments
        })
      })

      return response.ok
    } catch (error) {
      logger.error('Error sending webhook message', { error })
      return false
    }
  }

  /**
   * Notify about project update
   */
  async sendProjectUpdate(project: Project, channel?: string): Promise<boolean> {
    const message: SlackMessage = {
      channel: channel || this.defaultChannel,
      text: `Project Update: ${project.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📊 Project Update: ${project.name}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Status:*\n${this.getStatusEmoji(project.status)} ${project.status}`
            },
            {
              type: 'mrkdwn',
              text: `*Progress:*\n${project.progress}% complete`
            },
            {
              type: 'mrkdwn',
              text: `*Client:*\n${project.client?.name || 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Next Milestone:*\n${project.nextMilestone || 'None'}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in KAZI'
              },
              url: `https://kazi.app/projects/${project.id}`,
              style: 'primary'
            }
          ]
        }
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Notify about milestone completion
   */
  async notifyMilestoneCompletion(milestone: Milestone, channel?: string): Promise<boolean> {
    logger.info('Notifying milestone completion', {
      milestoneId: milestone.id,
      name: milestone.name
    })

    const message: SlackMessage = {
      channel: channel || this.defaultChannel,
      text: `🎉 Milestone Completed: ${milestone.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🎉 Milestone Completed!`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${milestone.name}* in project *${milestone.projectName}* has been completed.`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Completed:*\n${new Date(milestone.completedAt).toLocaleString()}`
            },
            {
              type: 'mrkdwn',
              text: `*Deliverables:*\n${milestone.deliverables.length} items`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Deliverables:*\n${milestone.deliverables.map(d => `• ${d}`).join('\n')}`
          }
        }
      ],
      attachments: [
        {
          color: '#36a64f',
          fallback: `Milestone ${milestone.name} completed`
        }
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Notify about payment received
   */
  async notifyPaymentReceived(payment: Payment, channel?: string): Promise<boolean> {
    logger.info('Notifying payment received', {
      paymentId: payment.id,
      amount: payment.amount
    })

    const message: SlackMessage = {
      channel: channel || this.defaultChannel,
      text: `💰 Payment Received: $${payment.amount.toLocaleString()}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `💰 Payment Received`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Amount:*\n$${payment.amount.toLocaleString()}`
            },
            {
              type: 'mrkdwn',
              text: `*Client:*\n${payment.client}`
            },
            {
              type: 'mrkdwn',
              text: `*Project:*\n${payment.project}`
            },
            {
              type: 'mrkdwn',
              text: `*Method:*\n${payment.method}`
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Received at ${new Date(payment.receivedAt).toLocaleString()}`
            }
          ]
        }
      ],
      attachments: [
        {
          color: '#2eb886',
          fallback: `Payment of $${payment.amount} received`
        }
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Notify about deliverable ready for approval
   */
  async notifyDeliverableReady(deliverable: Deliverable, channel?: string): Promise<boolean> {
    logger.info('Notifying deliverable ready', {
      deliverableId: deliverable.id,
      name: deliverable.name
    })

    const message: SlackMessage = {
      channel: channel || this.defaultChannel,
      text: `✅ Deliverable Ready: ${deliverable.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `✅ Deliverable Ready for Approval`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${deliverable.name}* is ready for review in project *${deliverable.projectName}*.`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Client:*\n${deliverable.client}`
            },
            {
              type: 'mrkdwn',
              text: `*Files:*\n${deliverable.files.length} file(s)`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Files:*\n${deliverable.files.map(f => `• <${f.url}|${f.name}>`).join('\n')}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Review & Approve'
              },
              url: `https://kazi.app/deliverables/${deliverable.id}`,
              style: 'primary'
            }
          ]
        }
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Send client feedback notification
   */
  async notifyClientFeedback(
    projectName: string,
    clientName: string,
    rating: number,
    feedback: string,
    channel?: string
  ): Promise<boolean> {
    logger.info('Notifying client feedback', {
      project: projectName,
      rating
    })

    const message: SlackMessage = {
      channel: channel || this.defaultChannel,
      text: `⭐ Client Feedback: ${rating}/5 stars`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `⭐ New Client Feedback`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Project:*\n${projectName}`
            },
            {
              type: 'mrkdwn',
              text: `*Client:*\n${clientName}`
            },
            {
              type: 'mrkdwn',
              text: `*Rating:*\n${'⭐'.repeat(rating)} (${rating}/5)`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Feedback:*\n> ${feedback}`
          }
        }
      ],
      attachments: [
        {
          color: rating >= 4 ? '#36a64f' : rating >= 3 ? '#ff9900' : '#ff0000',
          fallback: `Client feedback: ${rating}/5 stars`
        }
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Send new project alert
   */
  async notifyNewProject(project: Project, channel?: string): Promise<boolean> {
    logger.info('Notifying new project', {
      projectId: project.id,
      name: project.name
    })

    const message: SlackMessage = {
      channel: channel || this.defaultChannel,
      text: `🚀 New Project: ${project.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚀 New Project Started`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${project.name}* has been created and assigned to the team.`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Client:*\n${project.client?.name || 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Timeline:*\n${project.timeline ? `${new Date(project.timeline.startDate).toLocaleDateString()} - ${new Date(project.timeline.endDate).toLocaleDateString()}` : 'TBD'}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Project'
              },
              url: `https://kazi.app/projects/${project.id}`,
              style: 'primary'
            }
          ]
        }
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Send urgent notification (issues, delays, disputes)
   */
  async sendUrgentNotification(
    title: string,
    description: string,
    details: Record<string, string>,
    actionUrl?: string,
    channel?: string
  ): Promise<boolean> {
    logger.warn('Sending urgent notification', {
      title,
      channel: channel || this.defaultChannel
    })

    const fields = Object.entries(details).map(([key, value]) => ({
      type: 'mrkdwn' as const,
      text: `*${key}:*\n${value}`
    }))

    const message: SlackMessage = {
      channel: channel || this.defaultChannel,
      text: `⚠️ URGENT: ${title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `⚠️ URGENT: ${title}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: description
          }
        },
        {
          type: 'section',
          fields
        },
        ...(actionUrl
          ? [
              {
                type: 'actions' as const,
                elements: [
                  {
                    type: 'button',
                    text: {
                      type: 'plain_text',
                      text: 'Take Action'
                    },
                    url: actionUrl,
                    style: 'danger'
                  }
                ]
              }
            ]
          : [])
      ],
      attachments: [
        {
          color: '#ff0000',
          fallback: `URGENT: ${title}`
        }
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(
    stats: {
      newProjects: number
      completedMilestones: number
      paymentsReceived: number
      totalRevenue: number
      activeClients: number
    },
    channel?: string
  ): Promise<boolean> {
    logger.info('Sending daily summary', { stats })

    const message: SlackMessage = {
      channel: channel || this.defaultChannel,
      text: `📊 Daily Summary`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📊 Daily Summary - ${new Date().toLocaleDateString()}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*New Projects:*\n${stats.newProjects}`
            },
            {
              type: 'mrkdwn',
              text: `*Completed Milestones:*\n${stats.completedMilestones}`
            },
            {
              type: 'mrkdwn',
              text: `*Payments Received:*\n${stats.paymentsReceived}`
            },
            {
              type: 'mrkdwn',
              text: `*Total Revenue:*\n$${stats.totalRevenue.toLocaleString()}`
            },
            {
              type: 'mrkdwn',
              text: `*Active Clients:*\n${stats.activeClients}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Full Report'
              },
              url: `https://kazi.app/reports/daily`
            }
          ]
        }
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Helper: Get status emoji
   */
  private getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      'active': '🟢',
      'pending': '🟡',
      'completed': '✅',
      'on_hold': '⏸️',
      'cancelled': '❌',
      'at_risk': '⚠️'
    }
    return emojiMap[status.toLowerCase()] || '⚪'
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a Slack integration instance
 */
export function createSlackIntegration(config: SlackConfig): SlackIntegration {
  return new SlackIntegration(config)
}

/**
 * Test Slack connection
 */
export async function testSlackConnection(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return data.ok === true
  } catch (error) {
    logger.error('Failed to test Slack connection', { error })
    return false
  }
}
