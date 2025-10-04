export { BaseChart, createChartComponent, DEFAULT_CHART_CONFIG, chartUtils } from './base-chart'
export type {
  BaseChartProps,
  ChartState,
  BaseChartDataPoint,
  BaseChartMapping,
  ChartDimensions,
  TooltipState,
  ChartVariant,
  ChartConfig,
  DataType,
  DataTypeMap,
  SuggestedMapping,
  ChartScale,
  ChartScales
} from './types'

// Re-export core types from components/core/types
export type {
  BaseChartCoreConfig,
  ChartStateCallbacks,
  BaseChartData
} from '../types'