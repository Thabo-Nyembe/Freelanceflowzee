'use client'

/**
 * World-Class ML Insights Dashboard
 * Complete implementation of machine learning insights and predictions
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, TrendingUp, AlertTriangle, Lightbulb, Zap, Target,
  BarChart3, Users, DollarSign, Shield, Star, CheckCircle,
  ArrowUp, ArrowDown, Minus, Info, Sparkles, Activity,
  Clock, Eye, Filter, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  MLInsight,
  TrendAnalysis,
  AnomalyDetection,
  RecommendationEngine,
  ChurnPrediction
} from '@/lib/ml-insights-types'
import {
  MOCK_INSIGHTS,
  MOCK_TRENDS,
  MOCK_ANOMALIES,
  MOCK_RECOMMENDATIONS,
  MOCK_CHURN_PREDICTIONS,
  formatPercentage,
  formatNumber,
  getConfidenceColor,
  getImpactColor,
  getSeverityColor,
  confidenceToPercentage,
  getRiskColor
} from '@/lib/ml-insights-utils'

type ViewMode = 'insights' | 'trends' | 'predictions' | 'recommendations'

export default function MLInsightsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('insights')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  const getInsightIcon = (type: string) => {
    const icons: Record<string, any> = {
      trend: TrendingUp,
      anomaly: AlertTriangle,
      forecast: Activity,
      pattern: Eye,
      recommendation: Lightbulb,
      alert: AlertTriangle
    }
    return icons[type] || Brain
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-teal-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-full text-sm font-medium mb-6 border border-blue-500/30"
              >
                <Brain className="w-4 h-4" />
                ML Insights
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Machine Learning Insights
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                AI-powered analytics with predictive modeling, anomaly detection, and intelligent recommendations
              </p>
            </div>
          </ScrollReveal>

          {/* View Mode Tabs */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="flex items-center justify-center gap-2 mb-8">
              {[
                { id: 'insights' as ViewMode, label: 'Insights', icon: Brain },
                { id: 'trends' as ViewMode, label: 'Trends', icon: TrendingUp },
                { id: 'predictions' as ViewMode, label: 'Predictions', icon: Activity },
                { id: 'recommendations' as ViewMode, label: 'Actions', icon: Lightbulb }
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={viewMode === mode.id ? "default" : "outline"}
                  onClick={() => setViewMode(mode.id)}
                  className={viewMode === mode.id ? "bg-gradient-to-r from-blue-600 to-cyan-600" : "border-gray-700 hover:bg-slate-800"}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </ScrollReveal>

          {/* Insights View */}
          {viewMode === 'insights' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Models', value: '8', change: '+2', icon: Brain, color: 'blue' },
                  { label: 'Accuracy', value: '94.2%', change: '+2.1%', icon: Target, color: 'green' },
                  { label: 'Predictions', value: '1.2K', change: '+156', icon: Activity, color: 'purple' },
                  { label: 'Insights', value: '24', change: '+8', icon: Lightbulb, color: 'orange' }
                ].map((metric, index) => (
                  <LiquidGlassCard key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
                      <Badge className={`bg-green-500/20 text-green-300 border-green-500/30 text-xs`}>
                        {metric.change}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-sm text-gray-400">{metric.label}</p>
                  </LiquidGlassCard>
                ))}
              </div>

              {/* Insights Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {MOCK_INSIGHTS.map((insight) => {
                  const Icon = getInsightIcon(insight.type)
                  return (
                    <motion.div key={insight.id} whileHover={{ scale: 1.02 }}>
                      <LiquidGlassCard className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${getImpactColor(insight.impact)}-500/20 to-${getImpactColor(insight.impact)}-600/20 flex items-center justify-center shrink-0`}>
                                <Icon className={`w-6 h-6 text-${getImpactColor(insight.impact)}-400`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                                <p className="text-sm text-gray-400">{insight.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={`bg-${getImpactColor(insight.impact)}-500/20 text-${getImpactColor(insight.impact)}-300 border-${getImpactColor(insight.impact)}-500/30 text-xs`}>
                              {insight.impact} impact
                            </Badge>
                            <Badge className={`bg-${getConfidenceColor(insight.confidence)}-500/20 text-${getConfidenceColor(insight.confidence)}-300 border-${getConfidenceColor(insight.confidence)}-500/30 text-xs`}>
                              {confidenceToPercentage(insight.confidence)}% confidence
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {insight.category}
                            </Badge>
                          </div>

                          {insight.actionable && insight.recommendations.length > 0 && (
                            <div className="pt-3 border-t border-gray-700">
                              <p className="text-xs font-medium text-gray-400 mb-2">Recommendations:</p>
                              <ul className="space-y-1">
                                {insight.recommendations.slice(0, 2).map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  )
                })}
              </div>

              {/* Anomalies */}
              {MOCK_ANOMALIES.length > 0 && (
                <LiquidGlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold text-white">Active Anomalies</h3>
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      {MOCK_ANOMALIES.length}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {MOCK_ANOMALIES.map((anomaly) => (
                      <div key={anomaly.id} className="p-4 bg-slate-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-white">{anomaly.metric}</h4>
                            <p className="text-sm text-gray-400">{anomaly.description}</p>
                          </div>
                          <Badge className={`bg-${getSeverityColor(anomaly.severity)}-500/20 text-${getSeverityColor(anomaly.severity)}-300 border-${getSeverityColor(anomaly.severity)}-500/30`}>
                            {anomaly.severity}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                          <div>
                            <span className="text-gray-400 block">Expected</span>
                            <span className="text-white font-medium">{anomaly.expectedValue}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Actual</span>
                            <span className="text-white font-medium">{anomaly.actualValue}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Deviation</span>
                            <span className="text-red-400 font-medium">+{anomaly.deviation}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </LiquidGlassCard>
              )}
            </div>
          )}

          {/* Trends View */}
          {viewMode === 'trends' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {MOCK_TRENDS.map((trend, index) => (
                  <LiquidGlassCard key={index} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{trend.metric}</h3>
                          <p className="text-sm text-gray-400">{trend.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {trend.direction === 'up' ? (
                            <ArrowUp className="w-5 h-5 text-green-400" />
                          ) : trend.direction === 'down' ? (
                            <ArrowDown className="w-5 h-5 text-red-400" />
                          ) : (
                            <Minus className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={`font-bold ${trend.direction === 'up' ? 'text-green-400' : trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                            {formatPercentage(trend.velocity)}
                          </span>
                        </div>
                      </div>

                      {/* Simple Trend Visualization */}
                      <div className="h-32 flex items-end gap-1">
                        {trend.dataPoints.slice(-20).map((point, idx) => {
                          const maxValue = Math.max(...trend.dataPoints.map(p => p.value))
                          const height = (point.value / maxValue) * 100
                          return (
                            <div
                              key={idx}
                              className="flex-1 bg-gradient-to-t from-blue-500/50 to-cyan-500/50 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                          )
                        })}
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700 text-sm">
                        <div>
                          <span className="text-gray-400 block">Next 7 Days</span>
                          <span className="text-white font-medium">{formatNumber(trend.forecast.next7Days)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Next 30 Days</span>
                          <span className="text-white font-medium">{formatNumber(trend.forecast.next30Days)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Confidence</span>
                          <Badge className={`bg-${getConfidenceColor(trend.forecast.confidence)}-500/20 text-${getConfidenceColor(trend.forecast.confidence)}-300 border-${getConfidenceColor(trend.forecast.confidence)}-500/30`}>
                            {trend.forecast.confidence}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                ))}
              </div>

              {/* Trend Stats */}
              <div className="space-y-6">
                <LiquidGlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Trend Summary</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Positive Trends</span>
                      <span className="font-semibold text-green-400">75%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Avg Growth</span>
                      <span className="font-semibold text-white">+10.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Confidence</span>
                      <span className="font-semibold text-white">High</span>
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Info className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-blue-400">Insight</h4>
                  </div>
                  <p className="text-xs text-gray-300">
                    All key metrics show positive momentum. Consider increasing investment in growth initiatives.
                  </p>
                </LiquidGlassCard>
              </div>
            </div>
          )}

          {/* Predictions View */}
          {viewMode === 'predictions' && (
            <div className="space-y-6">
              <LiquidGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Churn Risk Predictions</h3>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                    {MOCK_CHURN_PREDICTIONS.filter(p => p.risk === 'critical' || p.risk === 'high').length} At Risk
                  </Badge>
                </div>

                <div className="space-y-4">
                  {MOCK_CHURN_PREDICTIONS.map((prediction) => (
                    <div key={prediction.userId} className="p-4 bg-slate-900/50 rounded-lg border border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white">{prediction.userName}</h4>
                          <p className="text-sm text-gray-400">Churn Probability: {(prediction.churnProbability * 100).toFixed(0)}%</p>
                        </div>
                        <Badge className={`bg-${getRiskColor(prediction.risk)}-500/20 text-${getRiskColor(prediction.risk)}-300 border-${getRiskColor(prediction.risk)}-500/30`}>
                          {prediction.risk} risk
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-xs font-medium text-gray-400">Key Factors:</p>
                        {prediction.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                style={{ width: `${factor.impact * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-32">{factor.factor}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {prediction.recommendations.slice(0, 2).map((rec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-gray-700">
                            {rec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>
            </div>
          )}

          {/* Recommendations View */}
          {viewMode === 'recommendations' && (
            <div className="space-y-6">
              {MOCK_RECOMMENDATIONS.map((recommendation) => (
                <LiquidGlassCard key={recommendation.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Lightbulb className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">{recommendation.title}</h3>
                          <p className="text-sm text-gray-400">{recommendation.description}</p>
                        </div>
                      </div>
                      <Badge className={`bg-${getImpactColor(recommendation.priority === 'critical' ? 'high' : recommendation.priority as any)}-500/20 text-${getImpactColor(recommendation.priority === 'critical' ? 'high' : recommendation.priority as any)}-300 border-${getImpactColor(recommendation.priority === 'critical' ? 'high' : recommendation.priority as any)}-500/30`}>
                        {recommendation.priority}
                      </Badge>
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-300">Expected Impact</span>
                      </div>
                      <p className="text-xs text-green-400">
                        {recommendation.expectedImpact.improvement}% improvement in {recommendation.expectedImpact.metric} within {recommendation.expectedImpact.timeframe}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-400">Action Items:</p>
                      {recommendation.actions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                            <CheckCircle className={`w-4 h-4 ${action.status === 'completed' ? 'text-green-400' : 'text-gray-500'}`} />
                            <div>
                              <p className="text-sm font-medium text-white">{action.title}</p>
                              <p className="text-xs text-gray-400">{action.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-gray-700">
                              {action.effort} effort
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-700">
                              {action.impact} impact
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
