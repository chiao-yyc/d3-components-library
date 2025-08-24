export type ChartType = 
  | 'stackedArea'
  | 'area' 
  | 'bar'
  | 'waterfall'
  | 'scatter'
  | 'line'
  | 'candlestick'
  | 'boxplot'
  | 'violin'
  | 'heatmap'
  | 'treemap'
  | 'pie'
  | 'gauge'
  | 'radar'
  | 'correlogram'
  | 'funnel'

export const CHART_LAYER_ORDER: Record<ChartType, number> = {
  stackedArea: 0,
  area: 1,
  bar: 2,
  waterfall: 3,
  heatmap: 4,
  boxplot: 5,
  violin: 6,
  treemap: 7,
  pie: 8,
  scatter: 9,
  candlestick: 10,
  line: 11,
  gauge: 12,
  radar: 13,
  correlogram: 14,
  funnel: 15
} as const

export const DEFAULT_Z_INDEX_MAP: Record<ChartType, number> = {
  stackedArea: 10,
  area: 20,
  bar: 30,
  waterfall: 40,
  heatmap: 50,
  boxplot: 60,
  violin: 70,
  treemap: 80,
  pie: 90,
  scatter: 100,
  candlestick: 110,
  line: 120,
  gauge: 130,
  radar: 140,
  correlogram: 150,
  funnel: 160
} as const

export const CHART_LAYER_GROUPS = {
  background: ['stackedArea', 'area', 'heatmap'] as ChartType[],
  primary: ['bar', 'waterfall', 'boxplot', 'violin', 'treemap', 'pie'] as ChartType[],
  overlay: ['scatter', 'candlestick', 'line'] as ChartType[],
  specialty: ['gauge', 'radar', 'correlogram', 'funnel'] as ChartType[]
} as const

export const getChartZIndex = (chartType: ChartType): number => {
  return DEFAULT_Z_INDEX_MAP[chartType] ?? 50
}

export const getChartLayerOrder = (chartType: ChartType): number => {
  return CHART_LAYER_ORDER[chartType] ?? 50
}

export const getChartGroup = (chartType: ChartType): keyof typeof CHART_LAYER_GROUPS | null => {
  for (const [group, types] of Object.entries(CHART_LAYER_GROUPS)) {
    if (types.includes(chartType)) {
      return group as keyof typeof CHART_LAYER_GROUPS
    }
  }
  return null
}

export const sortChartsByLayer = <T extends { type?: ChartType }>(charts: T[]): T[] => {
  return [...charts].sort((a, b) => {
    const orderA = a.type ? getChartLayerOrder(a.type) : 50
    const orderB = b.type ? getChartLayerOrder(b.type) : 50
    return orderA - orderB
  })
}