import React, { useMemo } from 'react'
import * as d3 from 'd3'
import { ResponsiveChartContainer } from '../primitives/canvas/responsive-chart-container'
import {
  ChartCanvas,
  LayerManager,
  useScaleManager,
  XAxis,
  YAxis,
  DualAxis,
  Bar,
  Line,
  Area,
  StackedArea,
  Scatter,
  RegressionLine,
  Waterfall,
  type BarShapeData,
  type LineShapeData,
  type AreaShapeData,
  type StackedAreaData,
  type StackedAreaSeries,
  type ScatterShapeData,
  type RegressionData,
  type WaterfallShapeData
} from '../primitives'
import { MultiBar } from '../primitives/shapes/multi-bar'
import { sortChartsByLayer, type ChartType } from '../primitives/layouts/chart-layer-constants'

// 增強的數據接口 - 支援統一數據源
export interface EnhancedComboData {
  [key: string]: any
}

export interface ComboChartSeries {
  type: 'bar' | 'line' | 'area' | 'stackedArea' | 'scatter' | 'waterfall'
  dataKey: string // 指向數據中的欄位
  name: string
  yAxis: 'left' | 'right'
  color?: string
  // Bar 專用配置
  barWidth?: number
  barOpacity?: number
  barGroupKey?: string // 用於分組多個 bar 系列
  // Line 專用配置
  strokeWidth?: number
  showPoints?: boolean
  pointRadius?: number
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'
  // Area 專用配置
  areaOpacity?: number
  baseline?: number
  gradient?: { id: string; stops: { offset: string; color: string; opacity?: number }[] }
  // StackedArea 專用配置
  stackGroupKey?: string // 用於分組多個堆疊區域系列
  stackOrder?: 'ascending' | 'descending' | 'insideOut' | 'none' | 'reverse'
  stackOffset?: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle'
  // Scatter 專用配置
  scatterRadius?: number
  scatterOpacity?: number
  sizeKey?: string // 用於氣泡圖大小映射
  sizeRange?: [number, number]
  groupKey?: string // 用於分組著色
  strokeColor?: string
  scatterStrokeWidth?: number
  // Regression Line 專用配置
  showRegression?: boolean
  regressionType?: 'linear' | 'polynomial' | 'exponential'
  regressionColor?: string
  regressionWidth?: number
  regressionDasharray?: string
  showEquation?: boolean
  showRSquared?: boolean
  // Waterfall 專用配置
  typeKey?: string // 用於指定瀑布圖類型的數據字段
  waterfallOpacity?: number
  positiveColor?: string
  negativeColor?: string
  totalColor?: string
  subtotalColor?: string
  showConnectors?: boolean
  connectorColor?: string
  connectorWidth?: number
  connectorDasharray?: string
}

export interface EnhancedComboChartProps {
  data: EnhancedComboData[]
  series: ComboChartSeries[]
  
  // 維度和邊距
  width?: number
  height?: number
  responsive?: boolean  // 新增：響應式支援
  margin?: { top: number; right: number; bottom: number; left: number }
  
  // 數據映射
  xKey: string
  
  // 軸線配置
  leftAxis?: {
    label?: string
    domain?: [number, number]
    tickCount?: number
    tickFormat?: (value: any) => string
    gridlines?: boolean
  }
  rightAxis?: {
    label?: string
    domain?: [number, number]
    tickCount?: number
    tickFormat?: (value: any) => string
    gridlines?: boolean
  }
  xAxis?: {
    label?: string
    tickFormat?: (value: any) => string
    gridlines?: boolean
  }
  
  // 視覺配置
  colors?: string[]
  animate?: boolean
  animationDuration?: number
  
  // 交互配置
  interactive?: boolean
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
  
  className?: string
}

export const EnhancedComboChart: React.FC<EnhancedComboChartProps> = ({
  data,
  series,
  width,
  height,
  responsive,
  margin = { top: 20, right: 60, bottom: 50, left: 60 },
  xKey,
  leftAxis = {},
  rightAxis = {},
  xAxis = {},
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  animate = true,
  animationDuration = 300,
  interactive = true,
  onSeriesClick,
  onSeriesHover,
  className = ''
}) => {
  // 智能響應式檢測：如果明確指定了尺寸，則關閉響應式；否則預設開啟響應式
  const isResponsive = responsive !== undefined ? responsive : (width === undefined && height === undefined)
  const fallbackWidth = 800
  const fallbackHeight = 600  // 維持 4:3 比例 (800 * 3/4 = 600)
  // 驗證數據和系列配置
  if (!data?.length || !series?.length) {
    console.warn('EnhancedComboChart: Missing data or series', { data: data?.length, series: series?.length })
    return (
      <div className={`enhanced-combo-chart ${className}`}>
        <div className="empty-state">
          No data or series configuration provided
        </div>
      </div>
    )
  }

  console.log('EnhancedComboChart: Rendering with data', { dataLength: data.length, seriesLength: series.length, xKey })

  // 處理數據和比例尺域值
  const { xDomain, leftYDomain, rightYDomain, processedSeries } = useMemo(() => {
    // X 軸域值 - 支援時間、類別和數值
    const xValues = data.map(d => d[xKey])
    let xDomain: any[]
    
    // 智能檢測 X 軸類型
    const firstValue = xValues[0]
    if (firstValue instanceof Date || (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))) {
      // 時間軸
      xDomain = d3.extent(xValues.map(v => v instanceof Date ? v : new Date(v))) as [Date, Date]
    } else if (typeof firstValue === 'number') {
      // 數值軸
      xDomain = d3.extent(xValues) as [number, number]
    } else {
      // 類別軸
      xDomain = Array.from(new Set(xValues))
    }

    // 分析每個系列的數據範圍
    const leftSeries = series.filter(s => s.yAxis === 'left')
    const rightSeries = series.filter(s => s.yAxis === 'right')

    // 計算左軸域值
    let leftYDomain: [number, number] = [0, 1]
    if (leftSeries.length > 0) {
      // 檢查是否有堆疊區域系列和瀑布圖系列
      const leftStackedAreaSeries = leftSeries.filter(s => s.type === 'stackedArea')
      const leftWaterfallSeries = leftSeries.filter(s => s.type === 'waterfall')
      const leftNonStackedSeries = leftSeries.filter(s => s.type !== 'stackedArea' && s.type !== 'waterfall')

      let leftValues: number[] = []

      // 處理非堆疊系列
      if (leftNonStackedSeries.length > 0) {
        leftValues = leftValues.concat(
          leftNonStackedSeries.flatMap(s => 
            data.map(d => Number(d[s.dataKey]) || 0).filter(v => !isNaN(v))
          )
        )
      }

      // 處理瀑布圖系列 - 需要計算累積值範圍
      if (leftWaterfallSeries.length > 0) {
        leftWaterfallSeries.forEach(s => {
          let cumulativeValue = 0
          const waterfallValues: number[] = [0] // 包含起始的 0
          
          data.forEach(d => {
            const value = Number(d[s.dataKey]) || 0
            const type = s.typeKey ? d[s.typeKey] : (value >= 0 ? 'positive' : 'negative')
            
            switch (type) {
              case 'total':
              case 'subtotal':
                cumulativeValue += value
                waterfallValues.push(0, cumulativeValue) // 添加起點和終點
                break
              case 'positive':
              case 'negative':
              default:
                waterfallValues.push(cumulativeValue) // 添加當前累積值
                cumulativeValue += value
                waterfallValues.push(cumulativeValue) // 添加新的累積值
                break
            }
          })
          
          leftValues = leftValues.concat(waterfallValues)
        })
      }

      // 處理堆疊系列 - 需要計算堆疊總和
      if (leftStackedAreaSeries.length > 0) {
        // 按堆疊組分組
        const stackGroups = new Map<string, typeof leftStackedAreaSeries>()
        leftStackedAreaSeries.forEach(s => {
          const groupKey = s.stackGroupKey || 'default'
          if (!stackGroups.has(groupKey)) {
            stackGroups.set(groupKey, [])
          }
          stackGroups.get(groupKey)!.push(s)
        })

        // 計算每個堆疊組的總和
        stackGroups.forEach(groupSeries => {
          const stackedTotals = data.map(d => 
            groupSeries.reduce((sum, s) => sum + (Number(d[s.dataKey]) || 0), 0)
          )
          leftValues = leftValues.concat(stackedTotals)
        })
      }

      if (leftValues.length > 0) {
        const extent = d3.extent(leftValues) as [number, number]
        // 檢查是否有堆疊區域系列，如果有則強制從 0 開始
        const hasStackedArea = leftStackedAreaSeries.length > 0
        leftYDomain = [
          hasStackedArea ? 0 : Math.min(0, extent[0]), 
          extent[1] * 1.1 // 頂部留 10% 空間
        ]
      }
    }

    // 計算右軸域值
    let rightYDomain: [number, number] = [0, 1]
    if (rightSeries.length > 0) {
      // 檢查是否有堆疊區域系列和瀑布圖系列
      const rightStackedAreaSeries = rightSeries.filter(s => s.type === 'stackedArea')
      const rightWaterfallSeries = rightSeries.filter(s => s.type === 'waterfall')
      const rightNonStackedSeries = rightSeries.filter(s => s.type !== 'stackedArea' && s.type !== 'waterfall')

      let rightValues: number[] = []

      // 處理非堆疊系列
      if (rightNonStackedSeries.length > 0) {
        rightValues = rightValues.concat(
          rightNonStackedSeries.flatMap(s => 
            data.map(d => Number(d[s.dataKey]) || 0).filter(v => !isNaN(v))
          )
        )
      }

      // 處理瀑布圖系列 - 需要計算累積值範圍
      if (rightWaterfallSeries.length > 0) {
        rightWaterfallSeries.forEach(s => {
          let cumulativeValue = 0
          const waterfallValues: number[] = [0] // 包含起始的 0
          
          data.forEach(d => {
            const value = Number(d[s.dataKey]) || 0
            const type = s.typeKey ? d[s.typeKey] : (value >= 0 ? 'positive' : 'negative')
            
            switch (type) {
              case 'total':
              case 'subtotal':
                cumulativeValue += value
                waterfallValues.push(0, cumulativeValue) // 添加起點和終點
                break
              case 'positive':
              case 'negative':
              default:
                waterfallValues.push(cumulativeValue) // 添加當前累積值
                cumulativeValue += value
                waterfallValues.push(cumulativeValue) // 添加新的累積值
                break
            }
          })
          
          rightValues = rightValues.concat(waterfallValues)
        })
      }

      // 處理堆疊系列 - 需要計算堆疊總和
      if (rightStackedAreaSeries.length > 0) {
        // 按堆疊組分組
        const stackGroups = new Map<string, typeof rightStackedAreaSeries>()
        rightStackedAreaSeries.forEach(s => {
          const groupKey = s.stackGroupKey || 'default'
          if (!stackGroups.has(groupKey)) {
            stackGroups.set(groupKey, [])
          }
          stackGroups.get(groupKey)!.push(s)
        })

        // 計算每個堆疊組的總和
        stackGroups.forEach(groupSeries => {
          const stackedTotals = data.map(d => 
            groupSeries.reduce((sum, s) => sum + (Number(d[s.dataKey]) || 0), 0)
          )
          rightValues = rightValues.concat(stackedTotals)
        })
      }

      if (rightValues.length > 0) {
        const extent = d3.extent(rightValues) as [number, number]
        // 檢查是否有堆疊區域系列，如果有則強制從 0 開始
        const hasStackedArea = rightStackedAreaSeries.length > 0
        rightYDomain = [
          hasStackedArea ? 0 : Math.min(0, extent[0]),
          extent[1] * 1.1
        ]
      }
    }

    // 處理系列配置，添加顏色
    const processedSeries = series.map((s, index) => ({
      ...s,
      color: s.color || colors[index % colors.length]
    }))

    return { xDomain, leftYDomain, rightYDomain, processedSeries }
  }, [data, series, xKey, colors])

  // 使用用戶提供的域值覆蓋自動計算的值
  const finalLeftYDomain = leftAxis.domain || leftYDomain
  const finalRightYDomain = rightAxis.domain || rightYDomain

  // 響應式圖表內容渲染器
  const renderComboChart = (chartWidth: number, chartHeight: number) => {
    const contentArea = {
      width: chartWidth - margin.left - margin.right,
      height: chartHeight - margin.top - margin.bottom
    }

    return (
      <ChartCanvas
        width={chartWidth}
        height={chartHeight}
        margin={margin}
        className="enhanced-combo-chart-canvas"
      >
        <LayerManager>
          <EnhancedComboChartContent
            data={data}
            series={processedSeries}
            xKey={xKey}
            xDomain={xDomain}
            leftYDomain={finalLeftYDomain}
            rightYDomain={finalRightYDomain}
            contentArea={contentArea}
            leftAxis={leftAxis}
            rightAxis={rightAxis}
            xAxis={xAxis}
            animate={animate}
            animationDuration={animationDuration}
            interactive={interactive}
            onSeriesClick={onSeriesClick}
            onSeriesHover={onSeriesHover}
          />
        </LayerManager>
      </ChartCanvas>
    )
  }

  if (isResponsive) {
    return (
      <div className={`enhanced-combo-chart ${className}`}>
        <ResponsiveChartContainer>
          {({ width: containerWidth, height: containerHeight }) => 
            renderComboChart(containerWidth, containerHeight)
          }
        </ResponsiveChartContainer>
      </div>
    )
  }

  // 固定尺寸模式
  return (
    <div className={`enhanced-combo-chart ${className}`}>
      {renderComboChart(width || fallbackWidth, height || fallbackHeight)}
    </div>
  )
}

// 比例尺註冊組件
interface ScalesRegistrationProps {
  xDomain: any[]
  leftYDomain: [number, number]
  rightYDomain: [number, number]
  contentArea: { width: number; height: number }
  hasLeftSeries: boolean
  hasRightSeries: boolean
}

const ScalesRegistration: React.FC<ScalesRegistrationProps> = ({
  xDomain,
  leftYDomain,
  rightYDomain,
  contentArea,
  hasLeftSeries,
  hasRightSeries
}) => {
  const { registerExistingScale } = useScaleManager()

  // 註冊 X 軸比例尺
  useMemo(() => {
    const firstValue = xDomain[0]
    let scale: any

    if (firstValue instanceof Date) {
      scale = d3.scaleTime()
        .domain(xDomain as [Date, Date])
        .range([0, contentArea.width])
    } else if (typeof firstValue === 'number') {
      scale = d3.scaleLinear()
        .domain(xDomain as [number, number])
        .range([0, contentArea.width])
        .nice()
    } else {
      scale = d3.scaleBand()
        .domain(xDomain)
        .range([0, contentArea.width])
        .padding(0.1)
    }

    const registeredScale = registerExistingScale('x', scale, {
      type: firstValue instanceof Date ? 'time' : typeof firstValue === 'number' ? 'linear' : 'band',
      domain: xDomain,
      range: [0, contentArea.width],
      padding: typeof firstValue === 'string' ? 0.1 : undefined,
      nice: typeof firstValue === 'number'
    }, 'x')

    console.log('ScalesRegistration: Registered xScale', { 
      scale: registeredScale ? 'success' : 'failed',
      type: typeof firstValue,
      domain: xDomain
    })

    return scale
  }, [xDomain, contentArea.width, registerExistingScale])

  // 註冊左 Y 軸比例尺
  useMemo(() => {
    if (!hasLeftSeries) return null

    const scale = d3.scaleLinear()
      .domain(leftYDomain)
      .range([contentArea.height, 0])
      .nice()

    registerExistingScale('leftY', scale, {
      type: 'linear',
      domain: leftYDomain,
      range: [contentArea.height, 0],
      nice: true
    }, 'y')

    return scale
  }, [leftYDomain, contentArea.height, hasLeftSeries, registerExistingScale])

  // 註冊右 Y 軸比例尺
  useMemo(() => {
    if (!hasRightSeries) return null

    const scale = d3.scaleLinear()
      .domain(rightYDomain)
      .range([contentArea.height, 0])
      .nice()

    registerExistingScale('rightY', scale, {
      type: 'linear',
      domain: rightYDomain,
      range: [contentArea.height, 0],
      nice: true
    }, 'y2')

    return scale
  }, [rightYDomain, contentArea.height, hasRightSeries, registerExistingScale])

  return null // 這個組件不渲染任何內容，只負責註冊比例尺
}

// 統一的內容組件
interface EnhancedComboChartContentProps {
  data: EnhancedComboData[]
  series: (ComboChartSeries & { color: string })[]
  xKey: string
  xDomain: any[]
  leftYDomain: [number, number]
  rightYDomain: [number, number]
  contentArea: { width: number; height: number }
  leftAxis: EnhancedComboChartProps['leftAxis']
  rightAxis: EnhancedComboChartProps['rightAxis']
  xAxis: EnhancedComboChartProps['xAxis']
  animate: boolean
  animationDuration: number
  interactive: boolean
  onSeriesClick?: EnhancedComboChartProps['onSeriesClick']
  onSeriesHover?: EnhancedComboChartProps['onSeriesHover']
}

const EnhancedComboChartContent: React.FC<EnhancedComboChartContentProps> = (props) => {
  const {
    data, series, xKey, xDomain, leftYDomain, rightYDomain, contentArea,
    leftAxis, rightAxis, xAxis, animate, animationDuration, interactive,
    onSeriesClick, onSeriesHover
  } = props
  
  const { registerExistingScale, getScale } = useScaleManager()

  // 同步註冊和使用比例尺
  const { xScale, leftYScale, rightYScale } = useMemo(() => {
    console.log('📦 Creating and registering scales...')
    
    // 創建 X 軸比例尺
    const firstValue = xDomain[0]
    let xScale: any

    if (firstValue instanceof Date) {
      xScale = d3.scaleTime()
        .domain(xDomain as [Date, Date])
        .range([0, contentArea.width])
    } else if (typeof firstValue === 'number') {
      xScale = d3.scaleLinear()
        .domain(xDomain as [number, number])
        .range([0, contentArea.width])
        .nice()
    } else {
      xScale = d3.scaleBand()
        .domain(xDomain)
        .range([0, contentArea.width])
        .padding(0.1)
    }

    // 創建 Y 軸比例尺
    const leftYScale = d3.scaleLinear()
      .domain(leftYDomain)
      .range([contentArea.height, 0])
      .nice()

    const rightYScale = d3.scaleLinear()
      .domain(rightYDomain)
      .range([contentArea.height, 0])
      .nice()

    // 註冊比例尺
    registerExistingScale('x', xScale, {
      type: firstValue instanceof Date ? 'time' : typeof firstValue === 'number' ? 'linear' : 'band',
      domain: xDomain,
      range: [0, contentArea.width],
      padding: typeof firstValue === 'string' ? 0.1 : undefined,
      nice: typeof firstValue === 'number'
    }, 'x')

    if (series.some(s => s.yAxis === 'left')) {
      registerExistingScale('leftY', leftYScale, {
        type: 'linear',
        domain: leftYDomain,
        range: [contentArea.height, 0],
        nice: true
      }, 'y')
    }

    if (series.some(s => s.yAxis === 'right')) {
      registerExistingScale('rightY', rightYScale, {
        type: 'linear',
        domain: rightYDomain,
        range: [contentArea.height, 0],
        nice: true
      }, 'y2')
    }

    console.log('✅ Scales registered successfully')
    
    return { xScale, leftYScale, rightYScale }
  }, [xDomain, leftYDomain, rightYDomain, contentArea, series, registerExistingScale])

  // 驗證比例尺可用性
  const registeredXScale = getScale('x')
  const registeredLeftYScale = getScale('leftY')
  const registeredRightYScale = getScale('rightY')

  console.log('🔍 Scale availability check:', {
    xScale: !!registeredXScale,
    leftYScale: !!registeredLeftYScale,
    rightYScale: !!registeredRightYScale
  })

  return (
    <>
      {/* 直接渲染軸線 */}
      <DirectAxisRenderer
        xScale={xScale}
        leftYScale={leftYScale}
        rightYScale={rightYScale}
        leftAxis={leftAxis}
        rightAxis={rightAxis}
        xAxis={xAxis}
        hasLeftSeries={series.some(s => s.yAxis === 'left')}
        hasRightSeries={series.some(s => s.yAxis === 'right')}
      />
      
      {/* 直接渲染圖形 */}
      <DirectChartRenderer
        data={data}
        series={series}
        xKey={xKey}
        xScale={xScale}
        leftYScale={leftYScale}
        rightYScale={rightYScale}
        animate={animate}
        animationDuration={animationDuration}
        interactive={interactive}
        onSeriesClick={onSeriesClick}
        onSeriesHover={onSeriesHover}
      />
    </>
  )
}

// 直接軸線渲染器
interface DirectAxisRendererProps {
  xScale: any
  leftYScale: any
  rightYScale: any
  leftAxis: EnhancedComboChartProps['leftAxis']
  rightAxis: EnhancedComboChartProps['rightAxis']
  xAxis: EnhancedComboChartProps['xAxis']
  hasLeftSeries: boolean
  hasRightSeries: boolean
}

const DirectAxisRenderer: React.FC<DirectAxisRendererProps> = ({
  xScale, leftYScale, rightYScale, leftAxis, rightAxis, xAxis, hasLeftSeries, hasRightSeries
}) => {
  console.log('🎯 DirectAxisRenderer rendering with scales:', {
    xScale: !!xScale,
    leftYScale: !!leftYScale,
    rightYScale: !!rightYScale
  })

  return (
    <>
      {/* X 軸 */}
      {xScale && (
        <XAxis
          scale={xScale}
          label={xAxis?.label}
          tickFormat={xAxis?.tickFormat}
          gridlines={xAxis?.gridlines}
          className="enhanced-combo-x-axis"
        />
      )}
      
      {/* Y 軸 */}
      {hasLeftSeries && hasRightSeries && leftYScale && rightYScale ? (
        <DualAxis
          leftAxis={{
            scale: leftYScale,
            label: leftAxis?.label,
            tickCount: leftAxis?.tickCount,
            tickFormat: leftAxis?.tickFormat,
            gridlines: leftAxis?.gridlines,
            className: "enhanced-combo-left-axis"
          }}
          rightAxis={{
            scale: rightYScale,
            label: rightAxis?.label,
            tickCount: rightAxis?.tickCount,
            tickFormat: rightAxis?.tickFormat,
            gridlines: rightAxis?.gridlines,
            className: "enhanced-combo-right-axis"
          }}
        />
      ) : hasLeftSeries && leftYScale ? (
        <YAxis
          scale={leftYScale}
          label={leftAxis?.label}
          tickCount={leftAxis?.tickCount}
          tickFormat={leftAxis?.tickFormat}
          gridlines={leftAxis?.gridlines}
          className="enhanced-combo-left-axis"
        />
      ) : hasRightSeries && rightYScale ? (
        <YAxis
          position="right"
          scale={rightYScale}
          label={rightAxis?.label}
          tickCount={rightAxis?.tickCount}
          tickFormat={rightAxis?.tickFormat}
          gridlines={rightAxis?.gridlines}
          className="enhanced-combo-right-axis"
        />
      ) : null}
    </>
  )
}

// 直接圖形渲染器
interface DirectChartRendererProps {
  data: EnhancedComboData[]
  series: (ComboChartSeries & { color: string })[]
  xKey: string
  xScale: any
  leftYScale: any
  rightYScale: any
  animate: boolean
  animationDuration: number
  interactive: boolean
  onSeriesClick?: EnhancedComboChartProps['onSeriesClick']
  onSeriesHover?: EnhancedComboChartProps['onSeriesHover']
}

const DirectChartRenderer: React.FC<DirectChartRendererProps> = ({
  data, series, xKey, xScale, leftYScale, rightYScale,
  animate, animationDuration, interactive, onSeriesClick, onSeriesHover
}) => {
  console.log('🎯 DirectChartRenderer rendering with scales:', {
    xScale: !!xScale,
    leftYScale: !!leftYScale,
    rightYScale: !!rightYScale,
    seriesCount: series.length
  })

  // Curve 字符串轉換為 D3 curve 函數
  const getCurveFunction = (curveType: string) => {
    switch (curveType) {
      case 'linear': return d3.curveLinear
      case 'monotone': return d3.curveMonotoneX
      case 'cardinal': return d3.curveCardinal
      case 'basis': return d3.curveBasis
      case 'step': return d3.curveStep
      default: return d3.curveLinear
    }
  }

  if (!xScale) {
    console.warn('⚠️ DirectChartRenderer: No xScale available')
    return null
  }

  // 使用標準化的圖層順序：stackedArea -> area -> bar -> waterfall -> scatter -> line
  const sortedSeries = sortChartsByLayer(
    series.map(s => ({ ...s, type: s.type as ChartType }))
  )

  // 處理多 Bar 分組
  const barSeries = sortedSeries.filter(s => s.type === 'bar')
  const stackedAreaSeries = sortedSeries.filter(s => s.type === 'stackedArea')
  const nonBarSeries = sortedSeries.filter(s => s.type !== 'bar' && s.type !== 'stackedArea')
  
  // 計算 Bar 分組
  const barGroups = new Map()
  barSeries.forEach((series, index) => {
    const groupKey = series.barGroupKey || 'default'
    if (!barGroups.has(groupKey)) {
      barGroups.set(groupKey, [])
    }
    barGroups.get(groupKey).push({ series, originalIndex: index })
  })

  // 處理 StackedArea 分組
  const stackedAreaGroups = new Map()
  stackedAreaSeries.forEach((series, index) => {
    const groupKey = series.stackGroupKey || 'default'
    if (!stackedAreaGroups.has(groupKey)) {
      stackedAreaGroups.set(groupKey, [])
    }
    stackedAreaGroups.get(groupKey).push({ series, originalIndex: index })
  })

  return (
    <>
      {/* 渲染分組的 StackedArea 系列 */}
      {Array.from(stackedAreaGroups.entries()).map(([groupKey, groupSeries]) => {
        const yScale = groupSeries[0]?.series.yAxis === 'left' ? leftYScale : rightYScale
        if (!yScale) {
          console.warn(`⚠️ No Y scale available for stacked area group ${groupKey}`)
          return null
        }

        // 準備堆疊區域的系列配置
        const stackedAreaSeriesConfig: StackedAreaSeries[] = groupSeries.map(item => ({
          key: item.series.dataKey,
          color: item.series.color,
          name: item.series.name,
          opacity: item.series.areaOpacity,
          gradient: item.series.gradient
        }))

        // 轉換數據格式用於堆疊
        const stackedAreaData: StackedAreaData[] = data.map(d => ({
          x: d[xKey],
          ...groupSeries.reduce((acc, item) => {
            acc[item.series.dataKey] = Number(d[item.series.dataKey]) || 0
            return acc
          }, {} as any)
        }))

        console.log(`🎨 Rendering stacked area group: ${groupKey}`, {
          dataPoints: stackedAreaData.length,
          seriesCount: stackedAreaSeriesConfig.length,
          yScale: groupSeries[0]?.series.yAxis
        })

        const firstSeries = groupSeries[0]?.series
        return (
          <StackedArea
            key={`stacked-area-${groupKey}`}
            data={stackedAreaData}
            series={stackedAreaSeriesConfig}
            xScale={xScale}
            yScale={yScale}
            curve={getCurveFunction(firstSeries?.curve || 'monotone')}
            animate={animate}
            animationDuration={animationDuration}
            stackOrder={firstSeries?.stackOrder || 'none'}
            stackOffset={firstSeries?.stackOffset || 'none'}
            className={`enhanced-combo-stacked-area-${groupKey}`}
            onAreaClick={interactive && onSeriesClick ? 
              (series, event) => onSeriesClick(
                groupSeries.find(gs => gs.series.dataKey === series.key)?.series || firstSeries, 
                null, 
                event
              ) : undefined}
            onAreaMouseEnter={interactive && onSeriesHover ?
              (series, event) => onSeriesHover(
                groupSeries.find(gs => gs.series.dataKey === series.key)?.series || firstSeries,
                null,
                event
              ) : undefined}
          />
        )
      })}

      {/* 渲染分組的 Bar 系列 */}
      {Array.from(barGroups.entries()).map(([groupKey, groupSeries]) => 
        groupSeries.map((item, groupIndex) => {
          const { series: seriesConfig, originalIndex } = item
          const yScale = seriesConfig.yAxis === 'left' ? leftYScale : rightYScale
          if (!yScale) {
            console.warn(`⚠️ No Y scale available for series ${seriesConfig.name}`)
            return null
          }

          // 計算分組偏移
          const groupSize = groupSeries.length
          const barWidthTotal = xScale.bandwidth ? xScale.bandwidth() : 40
          const barWidth = barWidthTotal / groupSize
          const groupOffset = (groupIndex - (groupSize - 1) / 2) * barWidth

          // 轉換數據格式並添加分組偏移
          const seriesData = data.map(d => ({
            x: d[xKey],
            y: Number(d[seriesConfig.dataKey]) || 0,
            originalData: d,
            groupOffset // 傳遞偏移量給 Bar 組件
          }))

          console.log(`🎨 Rendering bar series: ${seriesConfig.name} (group: ${groupKey}, offset: ${groupOffset})`, {
            dataPoints: seriesData.length,
            sampleData: seriesData.slice(0, 2),
            yScale: seriesConfig.yAxis,
            color: seriesConfig.color,
            groupOffset
          })

          return (
            <MultiBar
              key={`bar-${seriesConfig.name}-${originalIndex}`}
              data={seriesData}
              xScale={xScale}
              yScale={yScale}
              color={seriesConfig.color}
              opacity={seriesConfig.barOpacity || 0.8}
              alignment="center"
              animate={animate}
              animationDuration={animationDuration}
              className={`enhanced-combo-bar-${originalIndex}`}
              barWidth={barWidth}
              groupOffset={groupOffset}
              onBarClick={interactive && onSeriesClick ? 
                (d, i, event) => onSeriesClick(seriesConfig, d, event) : undefined}
              onBarMouseEnter={interactive && onSeriesHover ?
                (d, i, event) => onSeriesHover(seriesConfig, d, event) : undefined}
            />
          )
        })
      )}

      {/* 渲染非 Bar 系列 */}
      {nonBarSeries.map((seriesConfig, index) => {
        const yScale = seriesConfig.yAxis === 'left' ? leftYScale : rightYScale
        if (!yScale) {
          console.warn(`⚠️ No Y scale available for series ${seriesConfig.name}`)
          return null
        }

        // 轉換數據格式
        const seriesData = data.map(d => ({
          x: d[xKey],
          y: Number(d[seriesConfig.dataKey]) || 0,
          originalData: d
        }))

        console.log(`🎨 Rendering ${seriesConfig.type} series: ${seriesConfig.name}`, {
          dataPoints: seriesData.length,
          sampleData: seriesData.slice(0, 2),
          yScale: seriesConfig.yAxis,
          color: seriesConfig.color
        })

        const commonProps = {
          data: seriesData,
          xScale,
          yScale,
          color: seriesConfig.color,
          animate,
          animationDuration,
          className: `enhanced-combo-${seriesConfig.type}-${index}`
        }

        if (seriesConfig.type === 'area') {
          return (
            <Area
              key={`area-${seriesConfig.name}-${index}`}
              {...commonProps}
              opacity={seriesConfig.areaOpacity || 0.6}
              baseline={seriesConfig.baseline || 0}
              alignment="start"
              curve={getCurveFunction(seriesConfig.curve || 'monotone')}
              gradient={seriesConfig.gradient}
              onAreaClick={interactive && onSeriesClick ?
                (event) => onSeriesClick(seriesConfig, null, event) : undefined}
            />
          )
        } else if (seriesConfig.type === 'line') {
          return (
            <Line
              key={`line-${seriesConfig.name}-${index}`}
              {...commonProps}
              opacity={seriesConfig.lineOpacity || 1}
              strokeWidth={seriesConfig.strokeWidth || 2}
              showPoints={seriesConfig.showPoints ?? true}
              pointRadius={seriesConfig.pointRadius || 3}
              pointAlignment="center"
              curve={getCurveFunction(seriesConfig.curve || 'monotone')}
              onLineClick={interactive && onSeriesClick ?
                (event) => onSeriesClick(seriesConfig, null, event) : undefined}
              onPointClick={interactive && onSeriesClick ?
                (d, i, event) => onSeriesClick(seriesConfig, d, event) : undefined}
              onPointMouseEnter={interactive && onSeriesHover ?
                (d, i, event) => onSeriesHover(seriesConfig, d, event) : undefined}
            />
          )
        } else if (seriesConfig.type === 'scatter') {
          // 轉換 scatter 數據格式，支援氣泡圖
          const scatterData: ScatterShapeData[] = data.map(d => ({
            x: d[xKey],
            y: Number(d[seriesConfig.dataKey]) || 0,
            size: seriesConfig.sizeKey ? Number(d[seriesConfig.sizeKey]) : undefined,
            color: seriesConfig.groupKey ? d[seriesConfig.groupKey] : undefined,
            group: seriesConfig.groupKey ? d[seriesConfig.groupKey] : undefined,
            originalData: d
          }))

          // 創建大小比例尺（如果有 sizeKey）
          let sizeScale = null
          if (seriesConfig.sizeKey && seriesConfig.sizeRange) {
            const sizeValues = scatterData
              .map(d => d.size)
              .filter(s => s !== undefined) as number[]
            
            if (sizeValues.length > 0) {
              const sizeDomain = d3.extent(sizeValues) as [number, number]
              sizeScale = d3.scaleSqrt()
                .domain(sizeDomain)
                .range(seriesConfig.sizeRange)
            }
          }

          // 創建顏色比例尺（如果有 groupKey）
          let colorScale = null
          if (seriesConfig.groupKey) {
            const colorValues = Array.from(new Set(
              scatterData.map(d => d.group).filter(g => g !== undefined)
            ))
            
            if (colorValues.length > 0) {
              colorScale = d3.scaleOrdinal()
                .domain(colorValues)
                .range(d3.schemeCategory10)
            }
          }

          const scatterElement = (
            <Scatter
              key={`scatter-${seriesConfig.name}-${index}`}
              data={scatterData}
              xScale={xScale}
              yScale={yScale}
              radius={seriesConfig.scatterRadius || 4}
              sizeScale={sizeScale}
              colorScale={colorScale}
              opacity={seriesConfig.scatterOpacity || 0.7}
              strokeWidth={seriesConfig.scatterStrokeWidth || 1}
              strokeColor={seriesConfig.strokeColor || 'white'}
              pointAlignment="center"
              animate={animate}
              animationDuration={animationDuration}
              className={`enhanced-combo-scatter-${index}`}
              onPointClick={interactive && onSeriesClick ?
                (d, event) => onSeriesClick(seriesConfig, d.originalData, event) : undefined}
              onPointMouseEnter={interactive && onSeriesHover ?
                (d, event) => onSeriesHover(seriesConfig, d.originalData, event) : undefined}
            />
          )

          // 如果需要回歸線，同時渲染回歸線
          if (seriesConfig.showRegression) {
            const regressionData: RegressionData[] = scatterData.map(d => ({
              x: Number(d.x) || 0,
              y: Number(d.y) || 0
            }))

            return (
              <g key={`scatter-regression-${seriesConfig.name}-${index}`}>
                {scatterElement}
                <RegressionLine
                  data={regressionData}
                  xScale={xScale}
                  yScale={yScale}
                  strokeColor={seriesConfig.regressionColor || '#ef4444'}
                  strokeWidth={seriesConfig.regressionWidth || 2}
                  strokeDasharray={seriesConfig.regressionDasharray || '5,5'}
                  opacity={0.8}
                  regressionType={seriesConfig.regressionType || 'linear'}
                  showEquation={seriesConfig.showEquation || false}
                  showRSquared={seriesConfig.showRSquared || false}
                  animate={animate}
                  animationDuration={animationDuration}
                  className={`enhanced-combo-regression-${index}`}
                  onLineClick={interactive && onSeriesClick ?
                    (regressionInfo, event) => onSeriesClick(seriesConfig, regressionInfo, event) : undefined}
                />
              </g>
            )
          }

          return scatterElement
        } else if (seriesConfig.type === 'waterfall') {
          // 轉換 waterfall 數據格式
          const waterfallData: WaterfallShapeData[] = data.map(d => ({
            x: d[xKey],
            value: Number(d[seriesConfig.dataKey]) || 0,
            type: seriesConfig.typeKey ? d[seriesConfig.typeKey] : undefined,
            label: d.label,
            category: d.category,
            originalData: d
          }))

          return (
            <Waterfall
              key={`waterfall-${seriesConfig.name}-${index}`}
              data={waterfallData}
              xScale={xScale}
              yScale={yScale}
              animate={animate}
              animationDuration={animationDuration}
              opacity={seriesConfig.waterfallOpacity || 0.8}
              positiveColor={seriesConfig.positiveColor || '#10b981'}
              negativeColor={seriesConfig.negativeColor || '#ef4444'}
              totalColor={seriesConfig.totalColor || '#3b82f6'}
              subtotalColor={seriesConfig.subtotalColor || '#8b5cf6'}
              showConnectors={seriesConfig.showConnectors ?? true}
              connectorColor={seriesConfig.connectorColor || '#6b7280'}
              connectorWidth={seriesConfig.connectorWidth || 1}
              connectorDasharray={seriesConfig.connectorDasharray || '3,3'}
              strokeColor={seriesConfig.strokeColor || 'white'}
              strokeWidth={1}
              className={`enhanced-combo-waterfall-${index}`}
              onBarClick={interactive && onSeriesClick ?
                (d, cumulative, event) => onSeriesClick(seriesConfig, { ...d.originalData, cumulativeValue: cumulative }, event) : undefined}
              onBarMouseEnter={interactive && onSeriesHover ?
                (d, cumulative, event) => onSeriesHover(seriesConfig, { ...d.originalData, cumulativeValue: cumulative }, event) : undefined}
            />
          )
        }

        return null
      })}
    </>
  )
}

// 軸線組件
interface ScalesAndAxesProps {
  leftAxis: EnhancedComboChartProps['leftAxis']
  rightAxis: EnhancedComboChartProps['rightAxis']
  xAxis: EnhancedComboChartProps['xAxis']
  hasLeftSeries: boolean
  hasRightSeries: boolean
}

const ScalesAndAxes: React.FC<ScalesAndAxesProps> = ({
  leftAxis,
  rightAxis,
  xAxis,
  hasLeftSeries,
  hasRightSeries
}) => {
  const { getScale } = useScaleManager()

  // 獲取已註冊的比例尺
  const xScale = getScale('x')
  const leftYScale = getScale('leftY')
  const rightYScale = getScale('rightY')

  return (
    <>
      {/* X 軸 */}
      <XAxis
        scale={xScale}
        label={xAxis?.label}
        tickFormat={xAxis?.tickFormat}
        gridlines={xAxis?.gridlines}
        className="enhanced-combo-x-axis"
      />
      
      {/* Y 軸 */}
      {hasLeftSeries && hasRightSeries ? (
        <DualAxis
          leftAxis={{
            scale: leftYScale!,
            label: leftAxis?.label,
            tickCount: leftAxis?.tickCount,
            tickFormat: leftAxis?.tickFormat,
            gridlines: leftAxis?.gridlines,
            className: "enhanced-combo-left-axis"
          }}
          rightAxis={{
            scale: rightYScale!,
            label: rightAxis?.label,
            tickCount: rightAxis?.tickCount,
            tickFormat: rightAxis?.tickFormat,
            gridlines: rightAxis?.gridlines,
            className: "enhanced-combo-right-axis"
          }}
        />
      ) : hasLeftSeries ? (
        <YAxis
          scale={leftYScale!}
          label={leftAxis?.label}
          tickCount={leftAxis?.tickCount}
          tickFormat={leftAxis?.tickFormat}
          gridlines={leftAxis?.gridlines}
          className="enhanced-combo-left-axis"
        />
      ) : hasRightSeries ? (
        <YAxis
          position="right"
          scale={rightYScale!}
          label={rightAxis?.label}
          tickCount={rightAxis?.tickCount}
          tickFormat={rightAxis?.tickFormat}
          gridlines={rightAxis?.gridlines}
          className="enhanced-combo-right-axis"
        />
      ) : null}
    </>
  )
}

// 圖層組件
interface ChartLayersProps {
  data: EnhancedComboData[]
  series: (ComboChartSeries & { color: string })[]
  xKey: string
  xDomain: any[]
  leftYDomain: [number, number]
  rightYDomain: [number, number]
  contentArea: { width: number; height: number }
  animate: boolean
  animationDuration: number
  interactive: boolean
  onSeriesClick?: EnhancedComboChartProps['onSeriesClick']
  onSeriesHover?: EnhancedComboChartProps['onSeriesHover']
}

const ChartLayers: React.FC<ChartLayersProps> = ({
  data,
  series,
  xKey,
  xDomain,
  leftYDomain,
  rightYDomain,
  contentArea,
  animate,
  animationDuration,
  interactive,
  onSeriesClick,
  onSeriesHover
}) => {
  const { getScale } = useScaleManager()
  
  const xScale = getScale('x')
  const leftYScale = getScale('leftY')
  const rightYScale = getScale('rightY')

  // Curve 字符串轉換為 D3 curve 函數
  const getCurveFunction = (curveType: string) => {
    switch (curveType) {
      case 'linear': return d3.curveLinear
      case 'monotone': return d3.curveMonotoneX
      case 'cardinal': return d3.curveCardinal
      case 'basis': return d3.curveBasis
      case 'step': return d3.curveStep
      default: return d3.curveLinear
    }
  }

  if (!xScale) {
    console.warn('EnhancedComboChart: xScale not found from ScaleManager')
    return null
  }

  return (
    <>
      {series.map((seriesConfig, index) => {
        const yScale = seriesConfig.yAxis === 'left' ? leftYScale : rightYScale
        if (!yScale) return null

        // 轉換數據格式
        const seriesData = data.map(d => ({
          x: d[xKey],
          y: Number(d[seriesConfig.dataKey]) || 0,
          originalData: d
        }))

        console.log(`EnhancedComboChart: Series ${seriesConfig.name} data:`, {
          seriesType: seriesConfig.type,
          dataLength: seriesData.length,
          sampleData: seriesData.slice(0, 2),
          yScale: yScale ? 'exists' : 'missing',
          xScale: xScale ? 'exists' : 'missing'
        })

        const commonProps = {
          key: `${seriesConfig.type}-${index}`,
          data: seriesData,
          xScale,
          yScale,
          color: seriesConfig.color,
          animate,
          animationDuration,
          className: `enhanced-combo-${seriesConfig.type}-${index}`
        }

        if (seriesConfig.type === 'bar') {
          return (
            <Bar
              {...commonProps}
              opacity={seriesConfig.barOpacity || 0.8}
              onBarClick={interactive && onSeriesClick ? 
                (d, i, event) => onSeriesClick(seriesConfig, d, event) : undefined}
              onBarMouseEnter={interactive && onSeriesHover ?
                (d, i, event) => onSeriesHover(seriesConfig, d, event) : undefined}
            />
          )
        } else if (seriesConfig.type === 'line') {
          return (
            <Line
              {...commonProps}
              strokeWidth={seriesConfig.strokeWidth || 2}
              showPoints={seriesConfig.showPoints ?? true}
              pointRadius={seriesConfig.pointRadius || 3}
              curve={getCurveFunction(seriesConfig.curve || 'monotone')}
              onLineClick={interactive && onSeriesClick ?
                (event) => onSeriesClick(seriesConfig, null, event) : undefined}
              onPointClick={interactive && onSeriesClick ?
                (d, i, event) => onSeriesClick(seriesConfig, d, event) : undefined}
              onPointMouseEnter={interactive && onSeriesHover ?
                (d, i, event) => onSeriesHover(seriesConfig, d, event) : undefined}
            />
          )
        }

        return null
      })}
    </>
  )
}