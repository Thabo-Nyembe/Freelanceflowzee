'use client'

/**
 * Re-export recharts components for use in dashboard components
 * This provides a consistent import path: @/components/ui/charts
 */
export {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  RadarChart,
  RadialBarChart,
  ComposedChart,
  ScatterChart,
  Treemap,
  Sankey,
  FunnelChart,
  Bar,
  Line,
  Pie,
  Area,
  Radar,
  RadialBar,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Brush,
  ErrorBar,
  LabelList,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Sector,
  Curve,
  Rectangle,
  Layer,
} from 'recharts'

// Also export the chart utilities from the existing chart.tsx
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  type ChartConfig,
} from './chart'
