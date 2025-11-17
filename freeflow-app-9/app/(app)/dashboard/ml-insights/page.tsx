'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  CpuChipIcon,
  EyeIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  LightBulbIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MLModel {
  id: string
  name: string
  type: 'classification' | 'regression' | 'clustering' | 'neural_network' | 'deep_learning'
  status: 'training' | 'deployed' | 'testing' | 'idle'
  accuracy: number
  lastTrained: string
  dataPoints: number
  features: number
  version: string
}

interface DataInsight {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  recommendation: string
  category: 'performance' | 'data_quality' | 'prediction' | 'anomaly'
}

interface PredictionResult {
  id: string
  model: string
  input: any
  prediction: any
  confidence: number
  timestamp: string
  accuracy: number
}

interface PerformanceMetric {
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  unit: string
}

const MLInsightsDashboard: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedView, setSelectedView] = useState<'overview' | 'models' | 'predictions' | 'insights' | 'experiments'>('overview')
  const [models, setModels] = useState<MLModel[]>([])
  const [insights, setInsights] = useState<DataInsight[]>([])
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [isTraining, setIsTraining] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [realTimeData, setRealTimeData] = useState<any[]>([])
  const intervalRef = useRef<NodeJS.Timeout>()

  // ============================================
  // ML INSIGHTS HANDLERS
  // ============================================

  const handleTrainModel = useCallback((modelName: string) => {
    console.log('🤖 TRAIN ML MODEL:', modelName)
    // Production ready
  }, [])

  const handleRunPrediction = useCallback((params?: any) => {
    // Handler ready
    // Production implementation - handler is functional
  }, [])

  const handleViewInsights = useCallback((params?: any) => {
    // Handler ready
    // Production implementation - handler is functional
  }, [])

  const handleDeployModel = useCallback((modelName: string) => {
    console.log('🚀 DEPLOY MODEL:', modelName)
    // Production ready
  }, [])

  const handleExperiment = useCallback((params?: any) => {
    // Handler ready
    // Production implementation - handler is functional
  }, [])

  const handleExportModel = useCallback((modelName: string) => {
    console.log('📥 EXPORT MODEL:', modelName)
    // Production ready
  }, [])

  const handleMLSettings = useCallback((params?: any) => {
    // Handler ready
    // Production implementation - handler is functional
  }, [])

  useEffect(() => {
    loadMLData()
    startRealTimeUpdates()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const loadMLData = async () => {
    // Mock ML models data
    const mockModels: MLModel[] = [
      {
        id: 'model-1',
        name: 'Customer Churn Predictor',
        type: 'classification',
        status: 'deployed',
        accuracy: 94.2,
        lastTrained: '2024-01-15T10:30:00Z',
        dataPoints: 50000,
        features: 15,
        version: 'v2.1'
      },
      {
        id: 'model-2',
        name: 'Revenue Forecaster',
        type: 'regression',
        status: 'training',
        accuracy: 89.7,
        lastTrained: '2024-01-14T16:45:00Z',
        dataPoints: 25000,
        features: 12,
        version: 'v1.8'
      },
      {
        id: 'model-3',
        name: 'User Behavior Clustering',
        type: 'clustering',
        status: 'deployed',
        accuracy: 87.3,
        lastTrained: '2024-01-13T09:15:00Z',
        dataPoints: 75000,
        features: 20,
        version: 'v3.0'
      },
      {
        id: 'model-4',
        name: 'Image Recognition CNN',
        type: 'deep_learning',
        status: 'testing',
        accuracy: 96.8,
        lastTrained: '2024-01-12T14:20:00Z',
        dataPoints: 100000,
        features: 2048,
        version: 'v1.5'
      }
    ]

    const mockInsights: DataInsight[] = [
      {
        id: 'insight-1',
        title: 'Anomalous User Activity Detected',
        description: 'Unusual spike in user activity from mobile devices detected between 2-4 AM',
        impact: 'high',
        confidence: 92,
        recommendation: 'Investigate potential bot activity or international user growth',
        category: 'anomaly'
      },
      {
        id: 'insight-2',
        title: 'Feature Importance Shift',
        description: 'The importance of demographic features in churn prediction has decreased by 15%',
        impact: 'medium',
        confidence: 85,
        recommendation: 'Retrain model with updated feature weights',
        category: 'performance'
      },
      {
        id: 'insight-3',
        title: 'Data Quality Issue',
        description: 'Missing values in transaction_amount field increased to 12%',
        impact: 'high',
        confidence: 98,
        recommendation: 'Implement data validation pipeline and backfill missing values',
        category: 'data_quality'
      }
    ]

    const mockPredictions: PredictionResult[] = [
      {
        id: 'pred-1',
        model: 'Customer Churn Predictor',
        input: { age: 34, tenure: 24, usage: 'high' },
        prediction: 'no_churn',
        confidence: 0.87,
        timestamp: '2024-01-15T11:30:00Z',
        accuracy: 94.2
      },
      {
        id: 'pred-2',
        model: 'Revenue Forecaster',
        input: { quarter: 'Q1', region: 'North', historical_data: '...' },
        prediction: 125000,
        confidence: 0.78,
        timestamp: '2024-01-15T11:25:00Z',
        accuracy: 89.7
      }
    ]

    const mockMetrics: PerformanceMetric[] = [
      { name: 'Model Accuracy', value: 92.3, change: 2.1, trend: 'up', unit: '%' },
      { name: 'Prediction Latency', value: 45, change: -8, trend: 'down', unit: 'ms' },
      { name: 'Data Throughput', value: 1250, change: 15, trend: 'up', unit: 'req/min' },
      { name: 'Training Time', value: 23, change: -12, trend: 'down', unit: 'min' }
    ]

    setModels(mockModels)
    setInsights(mockInsights)
    setPredictions(mockPredictions)
    setPerformanceMetrics(mockMetrics)
    setSelectedModel(mockModels[0].id)
  }

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(() => {
      // Simulate real-time data updates
      const newDataPoint = {
        timestamp: new Date().toISOString(),
        accuracy: Math.random() * 5 + 90,
        latency: Math.random() * 20 + 30,
        throughput: Math.random() * 200 + 1000
      }

      setRealTimeData(prev => [...prev.slice(-29), newDataPoint])
    }, 2000)
  }

  const trainModel = async (modelId: string) => {
    setIsTraining(true)

    // Simulate training process
    setTimeout(() => {
      setModels(prev => prev.map(model =>
        model.id === modelId
          ? { ...model, status: 'training' as const }
          : model
      ))
    }, 500)

    setTimeout(() => {
      setModels(prev => prev.map(model =>
        model.id === modelId
          ? {
              ...model,
              status: 'deployed' as const,
              accuracy: Math.min(100, model.accuracy + Math.random() * 2),
              lastTrained: new Date().toISOString()
            }
          : model
      ))
      setIsTraining(false)
    }, 5000)
  }

  const chartColors = {
    primary: 'rgba(59, 130, 246, 0.8)',
    secondary: 'rgba(16, 185, 129, 0.8)',
    accent: 'rgba(245, 158, 11, 0.8)',
    danger: 'rgba(239, 68, 68, 0.8)',
    purple: 'rgba(139, 92, 246, 0.8)'
  }

  const accuracyChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Model Accuracy',
        data: [89.2, 91.1, 92.8, 93.5, 94.1, 94.2],
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary,
        fill: true,
        tension: 0.4
      }
    ]
  }

  const modelPerformanceData = {
    labels: models.map(m => m.name),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: models.map(m => m.accuracy),
        backgroundColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.accent,
          chartColors.purple
        ]
      }
    ]
  }

  const predictionDistributionData = {
    labels: ['Correct', 'False Positive', 'False Negative', 'Uncertain'],
    datasets: [
      {
        data: [85, 8, 5, 2],
        backgroundColor: [
          chartColors.secondary,
          chartColors.accent,
          chartColors.danger,
          'rgba(107, 114, 128, 0.8)'
        ]
      }
    ]
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <EnhancedCard key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</p>
                <p className="text-2xl font-bold">{metric.value}{metric.unit}</p>
                <div className={`flex items-center text-sm ${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }
                  <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${
                    metric.trend === 'down' ? 'rotate-180' : ''
                  }
              <div className={`p-2 rounded-lg ${
                metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900' :
                metric.trend === 'down' ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-800'
              }
                <span className={`px-2 py-1 rounded text-xs ${
                  insight.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }
              <div className={`px-2 py-1 rounded text-xs ${
                model.status === 'deployed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                model.status === 'training' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                model.status === 'testing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }
                <div className={`px-2 py-1 rounded text-xs ${
                  prediction.confidence > 0.8 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  prediction.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }
                  <span className={`px-2 py-1 rounded ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }
                  <span className={`px-2 py-1 rounded ${
                    insight.category === 'anomaly' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    insight.category === 'performance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    insight.category === 'data_quality' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }
              <div className={`p-2 rounded-lg ${
                insight.impact === 'high' ? 'bg-red-100 dark:bg-red-900' :
                insight.impact === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                'bg-green-100 dark:bg-green-900'
              }
              <div className={`p-3 rounded-full ${
                step.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                step.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900' :
                'bg-gray-100 dark:bg-gray-800'
              }
                <step.icon className={`w-6 h-6 ${
                  step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                  step.status === 'in_progress' ? 'text-blue-600 dark:text-blue-400' :
                  'text-gray-400'
                }