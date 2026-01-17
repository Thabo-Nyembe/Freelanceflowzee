/**
 * World-Class Charts Index
 *
 * Reusable chart components built on Recharts with:
 * - Dark/light theme support
 * - Loading and empty states
 * - TypeScript types
 * - Consistent styling
 */

// Area Chart
export {
  WorldClassAreaChart,
  type AreaChartDataPoint,
  type AreaConfig,
  type WorldClassAreaChartProps,
} from './area-chart'

// Bar Chart
export {
  WorldClassBarChart,
  type BarChartDataPoint,
  type BarConfig,
  type WorldClassBarChartProps,
} from './bar-chart'

// Line Chart
export {
  WorldClassLineChart,
  type LineChartDataPoint,
  type LineConfig,
  type ReferenceLineConfig,
  type WorldClassLineChartProps,
} from './line-chart'

// Pie Chart
export {
  WorldClassPieChart,
  type PieChartDataPoint,
  type WorldClassPieChartProps,
} from './pie-chart'
