import React from 'react'
export { AreaChart } from './area-chart'
export type { 
  AreaChartProps, 
  AreaDataPoint, 
  ProcessedAreaDataPoint,
  AreaSeriesData,
  SimpleAreaChartData,
  SimpleAreaChartProps
} from './types'
export { default as areaChartStyles } from './area-chart.css?inline'

// 便利導出 - 使用函數語法避免JSX問題
export const SimpleAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "simple" })
}

export const StackedAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "stacked" })
}

export const PercentAreaChart = (props: any) => {
  return React.createElement(AreaChart, { ...props, variant: "percent" })
}