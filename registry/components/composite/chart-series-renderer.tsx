import React from 'react'
import * as d3 from 'd3'
import {
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
} from '../primitives/shapes'
import { MultiBar } from '../primitives/shapes/multi-bar'
import type { ComboChartSeries, EnhancedComboData } from './chart-series-processor'
import { ChartScaleFactory } from './chart-scale-factory'

// 系列渲染器屬性
export interface ChartSeriesRendererProps {
  data: EnhancedComboData[]
  series: (ComboChartSeries & { color: string })[]
  xKey: string
  xScale: any
  leftYScale: any
  rightYScale: any
  animate: boolean
  animationDuration: number
  interactive: boolean
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
}

/**
 * 統一的圖表系列渲染器
 */
export const ChartSeriesRenderer: React.FC<ChartSeriesRendererProps> = ({
  data, 
  series, 
  xKey, 
  xScale, 
  leftYScale, 
  rightYScale,
  animate, 
  animationDuration, 
  interactive, 
  onSeriesClick, 
  onSeriesHover
}) => {
  console.log('🎯 ChartSeriesRenderer rendering with scales:', {
    xScale: !!xScale,
    leftYScale: !!leftYScale,
    rightYScale: !!rightYScale,
    seriesCount: series.length
  })

  if (!xScale) {
    console.warn('⚠️ ChartSeriesRenderer: No xScale available')
    return null
  }

  // 按類型排序：stackedArea -> area -> bar -> waterfall -> scatter -> line，確保正確的圖層順序
  const sortedSeries = [...series].sort((a, b) => {
    const order = { stackedArea: 0, area: 1, bar: 2, waterfall: 3, scatter: 4, line: 5 }
    return order[a.type] - order[b.type]
  })

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
      {Array.from(stackedAreaGroups.entries()).map(([groupKey, groupSeries]) => 
        renderStackedAreaGroup(groupKey, groupSeries, data, xKey, xScale, leftYScale, rightYScale, animate, animationDuration, interactive, onSeriesClick, onSeriesHover)
      )}

      {/* 渲染分組的 Bar 系列 */}
      {Array.from(barGroups.entries()).map(([groupKey, groupSeries]) => 
        renderBarGroup(groupKey, groupSeries, data, xKey, xScale, leftYScale, rightYScale, animate, animationDuration, interactive, onSeriesClick, onSeriesHover)
      )}

      {/* 渲染非 Bar 系列 */}
      {nonBarSeries.map((seriesConfig, index) => 
        renderNonBarSeries(seriesConfig, index, data, xKey, xScale, leftYScale, rightYScale, animate, animationDuration, interactive, onSeriesClick, onSeriesHover)
      )}
    </>
  )
}

/**
 * 渲染堆疊區域組
 */
function renderStackedAreaGroup(
  groupKey: string,
  groupSeries: any[],
  data: EnhancedComboData[],
  xKey: string,
  xScale: any,
  leftYScale: any,
  rightYScale: any,
  animate: boolean,
  animationDuration: number,
  interactive: boolean,
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void,
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
) {
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

  const firstSeries = groupSeries[0]?.series
  return (
    <StackedArea
      key={`stacked-area-${groupKey}`}
      data={stackedAreaData}
      series={stackedAreaSeriesConfig}
      xScale={xScale}
      yScale={yScale}
      curve={ChartScaleFactory.getCurveFunction(firstSeries?.curve || 'monotone')}
      animate={animate}
      animationDuration={animationDuration}
      stackOrder={firstSeries?.stackOrder || 'none'}
      stackOffset={firstSeries?.stackOffset || 'none'}
      className={`combo-stacked-area-${groupKey}`}
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
}

/**
 * 渲染 Bar 組
 */
function renderBarGroup(
  groupKey: string,
  groupSeries: any[],
  data: EnhancedComboData[],
  xKey: string,
  xScale: any,
  leftYScale: any,
  rightYScale: any,
  animate: boolean,
  animationDuration: number,
  interactive: boolean,
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void,
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
) {
  return groupSeries.map((item, groupIndex) => {
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
      groupOffset
    }))

    return (
      <MultiBar
        key={`bar-${seriesConfig.name}-${originalIndex}`}
        data={seriesData}
        xScale={xScale}
        yScale={yScale}
        color={seriesConfig.color}
        opacity={seriesConfig.barOpacity || 0.8}
        animate={animate}
        animationDuration={animationDuration}
        className={`combo-bar-${originalIndex}`}
        barWidth={barWidth}
        groupOffset={groupOffset}
        onBarClick={interactive && onSeriesClick ? 
          (d, i, event) => onSeriesClick(seriesConfig, d, event) : undefined}
        onBarMouseEnter={interactive && onSeriesHover ?
          (d, i, event) => onSeriesHover(seriesConfig, d, event) : undefined}
      />
    )
  })
}

/**
 * 渲染非 Bar 系列
 */
function renderNonBarSeries(
  seriesConfig: ComboChartSeries & { color: string },
  index: number,
  data: EnhancedComboData[],
  xKey: string,
  xScale: any,
  leftYScale: any,
  rightYScale: any,
  animate: boolean,
  animationDuration: number,
  interactive: boolean,
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void,
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
) {
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

  const commonProps = {
    data: seriesData,
    xScale,
    yScale,
    color: seriesConfig.color,
    animate,
    animationDuration,
    className: `combo-${seriesConfig.type}-${index}`
  }

  switch (seriesConfig.type) {
    case 'area':
      return (
        <Area
          key={`area-${seriesConfig.name}-${index}`}
          {...commonProps}
          opacity={seriesConfig.areaOpacity || 0.6}
          baseline={seriesConfig.baseline || 0}
          curve={ChartScaleFactory.getCurveFunction(seriesConfig.curve || 'monotone')}
          gradient={seriesConfig.gradient}
          onAreaClick={interactive && onSeriesClick ?
            (event) => onSeriesClick(seriesConfig, null, event) : undefined}
        />
      )

    case 'line':
      return (
        <Line
          key={`line-${seriesConfig.name}-${index}`}
          {...commonProps}
          strokeWidth={seriesConfig.strokeWidth || 2}
          showPoints={seriesConfig.showPoints ?? true}
          pointRadius={seriesConfig.pointRadius || 3}
          curve={ChartScaleFactory.getCurveFunction(seriesConfig.curve || 'monotone')}
          onLineClick={interactive && onSeriesClick ?
            (event) => onSeriesClick(seriesConfig, null, event) : undefined}
          onPointClick={interactive && onSeriesClick ?
            (d, i, event) => onSeriesClick(seriesConfig, d, event) : undefined}
          onPointMouseEnter={interactive && onSeriesHover ?
            (d, i, event) => onSeriesHover(seriesConfig, d, event) : undefined}
        />
      )

    case 'scatter':
      return renderScatterSeries(seriesConfig, index, data, xKey, xScale, yScale, animate, animationDuration, interactive, onSeriesClick, onSeriesHover)

    case 'waterfall':
      return renderWaterfallSeries(seriesConfig, index, data, xKey, xScale, yScale, animate, animationDuration, interactive, onSeriesClick, onSeriesHover)

    default:
      return null
  }
}

/**
 * 渲染散點圖系列
 */
function renderScatterSeries(
  seriesConfig: ComboChartSeries & { color: string },
  index: number,
  data: EnhancedComboData[],
  xKey: string,
  xScale: any,
  yScale: any,
  animate: boolean,
  animationDuration: number,
  interactive: boolean,
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void,
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
) {
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
      animate={animate}
      animationDuration={animationDuration}
      className={`combo-scatter-${index}`}
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
          className={`combo-regression-${index}`}
          onLineClick={interactive && onSeriesClick ?
            (regressionInfo, event) => onSeriesClick(seriesConfig, regressionInfo, event) : undefined}
        />
      </g>
    )
  }

  return scatterElement
}

/**
 * 渲染瀑布圖系列
 */
function renderWaterfallSeries(
  seriesConfig: ComboChartSeries & { color: string },
  index: number,
  data: EnhancedComboData[],
  xKey: string,
  xScale: any,
  yScale: any,
  animate: boolean,
  animationDuration: number,
  interactive: boolean,
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void,
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
) {
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
      className={`combo-waterfall-${index}`}
      onBarClick={interactive && onSeriesClick ?
        (d, cumulative, event) => onSeriesClick(seriesConfig, { ...d.originalData, cumulativeValue: cumulative }, event) : undefined}
      onBarMouseEnter={interactive && onSeriesHover ?
        (d, cumulative, event) => onSeriesHover(seriesConfig, { ...d.originalData, cumulativeValue: cumulative }, event) : undefined}
    />
  )
}