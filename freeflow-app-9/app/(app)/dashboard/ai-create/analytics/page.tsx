"use client"

import { Card } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { NumberFlow } from '@/components/ui/number-flow'
import { TrendingUp, TrendingDown, DollarSign, Zap, Clock, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const USAGE_BY_MODEL = [
  { model: 'Mistral 7B (Free)', requests: 432, tokens: 156890, cost: 0, color: 'green' },
  { model: 'Phi-3 Mini (Free)', requests: 289, tokens: 234560, cost: 0, color: 'green' },
  { model: 'Claude 3.5 Sonnet', requests: 45, tokens: 89340, cost: 1.52, color: 'purple' },
  { model: 'GPT-4o', requests: 23, tokens: 45620, cost: 0.89, color: 'purple' }
]

const RECENT_ACTIVITY = [
  { day: 'Mon', generations: 45, cost: 0.23 },
  { day: 'Tue', generations: 67, cost: 0.45 },
  { day: 'Wed', generations: 89, cost: 0.12 },
  { day: 'Thu', generations: 123, cost: 0.67 },
  { day: 'Fri', generations: 145, cost: 0.89 },
  { day: 'Sat', generations: 92, cost: 0.34 },
  { day: 'Sun', generations: 78, cost: 0.21 }
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Usage Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your AI generation usage, costs, and performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LiquidGlassCard variant="gradient" hoverEffect={true}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Total Generations
              </span>
            </div>
            <NumberFlow value={789} className="text-3xl font-bold text-blue-600 dark:text-blue-400" />
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+23% from last week</span>
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard variant="tinted" hoverEffect={true}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Total Cost
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">$2.91</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingDown className="h-3 w-3" />
              <span>-15% from last week</span>
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard variant="gradient" hoverEffect={true}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Avg Response Time
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <NumberFlow value={2.4} className="text-3xl font-bold text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">seconds</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingDown className="h-3 w-3" />
              <span>Improved by 18%</span>
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard variant="tinted" hoverEffect={true}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Free Tier Usage
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <NumberFlow value={91} className="text-3xl font-bold text-orange-600 dark:text-orange-400" />
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">%</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              721 of 789 generations
            </p>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Usage by Model */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Usage by Model</h3>
        <div className="space-y-3">
          {USAGE_BY_MODEL.map((model) => (
            <div key={model.model} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{model.model}</span>
                  <Badge
                    className={
                      model.color === 'green'
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 text-white'
                    }
                  >
                    {model.cost === 0 ? 'FREE' : 'Premium'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{model.requests} requests</span>
                  <span>{model.tokens.toLocaleString()} tokens</span>
                  <span className="font-semibold">
                    {model.cost === 0 ? 'Free' : `$${model.cost.toFixed(2)}`}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-4">
                <div
                  className={`h-full ${
                    model.color === 'green' ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${(model.requests / 432) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">7-Day Activity</h3>
        <div className="flex items-end justify-between gap-2 h-48">
          {RECENT_ACTIVITY.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-500"
                  style={{ height: `${(day.generations / 145) * 100}%` }}
                  title={`${day.generations} generations - $${day.cost.toFixed(2)}`}
                />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{day.day}</div>
              <div className="text-xs font-semibold">{day.generations}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cost Savings */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              💰 Cost Savings vs ChatGPT Plus
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Based on your usage of 789 generations this month
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Your Cost</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">$2.91</p>
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">ChatGPT Plus</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">$20.00</p>
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">You Saved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">$17.09</p>
              </div>
            </div>
          </div>
          <Badge className="bg-green-600 text-white text-lg px-4 py-2">
            85% Savings
          </Badge>
        </div>
      </Card>
    </div>
  )
}
