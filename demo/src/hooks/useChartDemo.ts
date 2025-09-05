import { useState, useCallback, useMemo } from 'react'

// === 通用圖表 Demo 配置介面 ===
export interface ChartDemoConfig {
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  animate?: boolean
  interactive?: boolean
  showTooltip?: boolean
  showGrid?: boolean
  showAxis?: boolean
  colors?: string[]
}

export interface DatasetOption<T = any> {
  label: string
  value: string
  data: T[]
  xKey: string
  yKey: string
  description?: string
}

// === 通用圖表 Demo 狀態管理 Hook ===
export function useChartDemo<T = any>(
  datasetOptions: DatasetOption<T>[], 
  defaultConfig?: Partial<ChartDemoConfig>
) {
  // === 基礎狀態 ===
  const [selectedDataset, setSelectedDataset] = useState(datasetOptions[0]?.value || '')
  const [config, setConfig] = useState<ChartDemoConfig>({
    width: 600,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 50 },
    animate: true,
    interactive: true,
    showTooltip: true,
    showGrid: true,
    showAxis: true,
    colors: ['#3b82f6'],
    ...defaultConfig
  })

  // === 計算當前資料集 ===
  const currentDataset = useMemo(
    () => datasetOptions.find(d => d.value === selectedDataset) || datasetOptions[0],
    [datasetOptions, selectedDataset]
  )

  // === 配置更新方法 ===
  const updateConfig = useCallback((newConfig: Partial<ChartDemoConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  const updateDimensions = useCallback((width: number, height: number) => {
    setConfig(prev => ({ ...prev, width, height }))
  }, [])

  const updateMargin = useCallback((margin: Partial<typeof config.margin>) => {
    setConfig(prev => ({ 
      ...prev, 
      margin: { ...prev.margin!, ...margin }
    }))
  }, [config.margin])

  const toggleFeature = useCallback((feature: keyof ChartDemoConfig) => {
    setConfig(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }))
  }, [])

  // === 事件處理器 ===
  const handleDataClick = useCallback((data: any) => {
    console.log('Chart data clicked:', data)
  }, [])

  const handleDataHover = useCallback((data: any) => {
    console.log('Chart data hovered:', data)
  }, [])

  const handleError = useCallback((error: Error) => {
    console.error('Chart error:', error)
  }, [])

  return {
    // 狀態
    selectedDataset,
    setSelectedDataset,
    config,
    currentDataset,
    
    // 更新方法
    updateConfig,
    updateDimensions,
    updateMargin,
    toggleFeature,
    
    // 事件處理器
    handleDataClick,
    handleDataHover,
    handleError,
    
    // 便利計算屬性
    chartData: currentDataset?.data || [],
    xKey: currentDataset?.xKey || '',
    yKey: currentDataset?.yKey || '',
    
    // 通用 props 組合
    commonProps: {
      data: currentDataset?.data || [],
      xKey: currentDataset?.xKey || '',
      yKey: currentDataset?.yKey || '',
      width: config.width,
      height: config.height,
      margin: config.margin,
      animate: config.animate,
      interactive: config.interactive,
      showTooltip: config.showTooltip,
      colors: config.colors,
      onDataClick: handleDataClick,
      onHover: handleDataHover,
      onError: handleError
    }
  }
}

// === 專用 Hook 變體 ===

// 條形圖專用 Hook
export function useBarChartDemo<T = any>(datasetOptions: DatasetOption<T>[]) {
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [showLabels, setShowLabels] = useState(false)
  const [labelPosition, setLabelPosition] = useState<'top' | 'center' | 'bottom'>('top')
  
  const baseDemo = useChartDemo(datasetOptions, {
    colors: ['#3b82f6']
  })
  
  return {
    ...baseDemo,
    orientation,
    setOrientation,
    showLabels,
    setShowLabels,
    labelPosition,
    setLabelPosition,
    barChartProps: {
      ...baseDemo.commonProps,
      orientation,
      showLabels,
      labelPosition
    }
  }
}

// 散布圖專用 Hook
export function useScatterPlotDemo<T = any>(datasetOptions: DatasetOption<T>[]) {
  const [showTrendline, setShowTrendline] = useState(false)
  const [opacity, setOpacity] = useState(0.7)
  const [pointSize, setPointSize] = useState(5)
  
  const baseDemo = useChartDemo(datasetOptions, {
    colors: ['#3b82f6', '#10b981', '#f59e0b']
  })
  
  return {
    ...baseDemo,
    showTrendline,
    setShowTrendline,
    opacity,
    setOpacity,
    pointSize,
    setPointSize,
    scatterPlotProps: {
      ...baseDemo.commonProps,
      showTrendline,
      opacity,
      pointSize
    }
  }
}

// 線圖專用 Hook
export function useLineChartDemo<T = any>(datasetOptions: DatasetOption<T>[]) {
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [showPoints, setShowPoints] = useState(true)
  const [curve, setCurve] = useState<'linear' | 'monotone' | 'cardinal'>('monotone')
  
  const baseDemo = useChartDemo(datasetOptions, {
    colors: ['#3b82f6']
  })
  
  return {
    ...baseDemo,
    strokeWidth,
    setStrokeWidth,
    showPoints,
    setShowPoints,
    curve,
    setCurve,
    lineChartProps: {
      ...baseDemo.commonProps,
      strokeWidth,
      showPoints,
      curve
    }
  }
}