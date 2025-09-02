/**
 * 統一的 D3 組件 UI 入口
 * 集中管理所有 Registry 組件的 Demo 引用 + 現代化 UI 組件
 * 
 * 設計原則：
 * - 保持與 Registry 組件的即時同步
 * - 統一的類型定義和介面
 * - 支援 Tree-shaking 優化
 * - 現代化設計系統組件
 */

// === 現代化 UI 組件 ===
// 核心模板和容器
export { DemoPageTemplate, ContentSection, GridContainer } from './DemoPageTemplate'
export { ChartContainer, StatusDisplay } from './ChartContainer'

// 控制面板組件
export { 
  ModernControlPanel,
  ControlGroup,
  ControlItem,
  RangeSlider,
  SelectControl,
  ToggleControl
} from './ModernControlPanel'

// 數據展示組件
export { DataTable } from './DataTable'
export { CodeExample, CodeExamples } from './CodeExample'
export { ResponsiveChart, useResponsiveChart } from './ResponsiveChart'
export { ChartTooltip } from './chart-tooltip'

// 類型導出
export type { 
  DemoPageTemplateProps,
  ContentSectionProps,
  GridContainerProps 
} from './DemoPageTemplate'

export type {
  ChartContainerProps,
  StatusDisplayProps
} from './ChartContainer'

export type {
  ModernControlPanelProps,
  ControlGroupProps,
  ControlItemProps,
  RangeSliderProps,
  SelectControlProps,
  ToggleControlProps
} from './ModernControlPanel'

export type {
  DataTableColumn,
  DataTableProps
} from './DataTable'

export type {
  CodeExampleProps,
  CodeExamplesProps
} from './CodeExample'

export type {
  ResponsiveChartProps
} from './ResponsiveChart'

// === 基礎圖表組件 ===
export { BarChart, type BarChartProps } from './bar-chart'
export { LineChart, type LineChartProps } from './line-chart'
export { AreaChart, type AreaChartProps } from './area-chart'
export { PieChart, DonutChart, PieChartWithLegend, type PieChartProps } from './pie-chart'

// === 統計圖表組件 ===
export { ScatterPlot, type ScatterPlotProps } from './scatter-plot'
export { BoxPlot, type BoxPlotProps } from './box-plot'
export { ViolinPlot, type ViolinPlotProps } from './violin-plot'
export { RadarChart, type RadarChartProps } from './radar-chart'

// === 特殊圖表組件 ===
export { HeatMap, type HeatMapProps } from './heatmap'
export { FunnelChart, type FunnelChartProps } from './funnel-chart'
export { GaugeChart, type GaugeChartProps } from './gauge-chart'

// === 資料處理組件 ===
export { DataMapper, type DataMapperProps } from './data-mapper'

// === 組件分類對照表 ===
export const CHART_CATEGORIES = {
  basic: ['BarChart', 'LineChart', 'AreaChart', 'PieChart'],
  statistical: ['ScatterPlot', 'BoxPlot', 'ViolinPlot', 'RadarChart'],
  special: ['HeatMap', 'FunnelChart', 'GaugeChart'],
  utility: []
} as const

// === 組件元數據 ===
export interface ChartComponentInfo {
  name: string
  category: keyof typeof CHART_CATEGORIES
  description: string
  demoPath: string
  registryPath: string
}

export const CHART_COMPONENTS_INFO: Record<string, ChartComponentInfo> = {
  BarChart: {
    name: 'BarChart',
    category: 'basic',
    description: '長條圖組件 - 比較不同類別的數值',
    demoPath: '/bar-chart',
    registryPath: '@registry/components/basic/bar-chart'
  },
  LineChart: {
    name: 'LineChart', 
    category: 'basic',
    description: '線圖組件 - 顯示數值隨時間變化',
    demoPath: '/line-chart',
    registryPath: '@registry/components/basic/line-chart'
  },
  AreaChart: {
    name: 'AreaChart',
    category: 'basic', 
    description: '面積圖組件 - 顯示數值變化趨勢',
    demoPath: '/area-chart',
    registryPath: '@registry/components/basic/area-chart'
  },
  PieChart: {
    name: 'PieChart',
    category: 'basic',
    description: '圓餅圖組件 - 顯示比例關係',
    demoPath: '/pie-chart',
    registryPath: '@registry/components/basic/pie-chart'
  },
  ScatterPlot: {
    name: 'ScatterPlot',
    category: 'statistical',
    description: '散佈圖組件 - 顯示兩個變數間關係',
    demoPath: '/scatter-plot',
    registryPath: '@registry/components/statistical/scatter-plot'
  },
  BoxPlot: {
    name: 'BoxPlot',
    category: 'statistical',
    description: '箱形圖組件 - 顯示數據分佈統計',
    demoPath: '/box-plot',
    registryPath: '@registry/components/statistical/box-plot'
  },
  ViolinPlot: {
    name: 'ViolinPlot',
    category: 'statistical',
    description: '小提琴圖組件 - 顯示數據密度分佈',
    demoPath: '/violin-plot',
    registryPath: '@registry/components/statistical/violin-plot'
  },
  RadarChart: {
    name: 'RadarChart',
    category: 'statistical',
    description: '雷達圖組件 - 多維度數據比較',
    demoPath: '/radar-chart',
    registryPath: '@registry/components/statistical/radar-chart'
  },
  HeatMap: {
    name: 'HeatMap',
    category: 'special',
    description: '熱力圖組件 - 顯示數據密度分佈',
    demoPath: '/heatmap',
    registryPath: '@registry/components/basic/heatmap'
  },
  FunnelChart: {
    name: 'FunnelChart',
    category: 'special',
    description: '漏斗圖組件 - 顯示轉換率流程',
    demoPath: '/funnel-chart',
    registryPath: '@registry/components/basic/funnel-chart'
  },
  GaugeChart: {
    name: 'GaugeChart',
    category: 'special',
    description: '儀表盤組件 - 顯示單一指標數值',
    demoPath: '/gauge-chart',
    registryPath: '@registry/components/basic/gauge-chart'
  },
  DataMapper: {
    name: 'DataMapper',
    category: 'utility',
    description: '資料映射組件 - 處理資料轉換',
    demoPath: '/data-mapper',
    registryPath: '@registry/components/data-mapper'
  }
}

// === 工具函數 ===
export function getComponentsByCategory(category: keyof typeof CHART_CATEGORIES) {
  return Object.values(CHART_COMPONENTS_INFO)
    .filter(comp => comp.category === category)
}

export function getAllComponents() {
  return Object.values(CHART_COMPONENTS_INFO)
}