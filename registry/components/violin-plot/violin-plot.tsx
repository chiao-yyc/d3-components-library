import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'
import { ViolinPlotProps, ProcessedViolinDataPoint, ViolinShape, ViolinStatistics, DensityPoint } from './types'

const DEFAULT_COLORS = [
  '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554',
  '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'
]

// 高斯核函數
function gaussianKernel(u: number): number {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
}

// Epanechnikov 核函數
function epanechnikovKernel(u: number): number {
  return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0
}

// 三角核函數
function triangularKernel(u: number): number {
  return Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0
}

// 核密度估計
function kernelDensityEstimation(
  values: number[],
  bandwidth: number,
  resolution: number = 100,
  method: string = 'gaussian',
  clipMin?: number,
  clipMax?: number
): DensityPoint[] {
  if (values.length === 0) return []

  const min = clipMin ?? Math.min(...values)
  const max = clipMax ?? Math.max(...values)
  const range = max - min
  const step = range / resolution

  const kernelFunction = 
    method === 'epanechnikov' ? epanechnikovKernel :
    method === 'triangular' ? triangularKernel :
    gaussianKernel

  const densityPoints: DensityPoint[] = []

  for (let i = 0; i <= resolution; i++) {
    const x = min + i * step
    let density = 0

    for (const value of values) {
      const u = (x - value) / bandwidth
      density += kernelFunction(u)
    }

    density = density / (values.length * bandwidth)
    densityPoints.push({ value: x, density })
  }

  return densityPoints
}

// 計算統計數據（重用 Box Plot 的邏輯）
function calculateViolinStatistics(values: number[]): ViolinStatistics {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  
  if (n === 0) {
    return {
      min: 0, q1: 0, median: 0, q3: 0, max: 0,
      outliers: [], iqr: 0, lowerFence: 0, upperFence: 0,
      count: 0
    }
  }
  
  // 計算四分位數
  const q1Index = Math.floor((n - 1) * 0.25)
  const medianIndex = Math.floor((n - 1) * 0.5)
  const q3Index = Math.floor((n - 1) * 0.75)
  
  const q1 = sorted[q1Index]
  const median = n % 2 === 0 
    ? (sorted[Math.floor(n / 2) - 1] + sorted[Math.floor(n / 2)]) / 2
    : sorted[medianIndex]
  const q3 = sorted[q3Index]
  
  const iqr = q3 - q1
  const mean = values.reduce((sum, val) => sum + val, 0) / n
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
  const std = Math.sqrt(variance)
  
  // 計算上下界限 (Tukey方法)
  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr
  
  // 找出異常值
  const outliers = sorted.filter(val => val < lowerFence || val > upperFence)
  
  // 找出whisker的實際範圍
  const validValues = sorted.filter(val => val >= lowerFence && val <= upperFence)
  const min = validValues.length > 0 ? Math.min(...validValues) : sorted[0]
  const max = validValues.length > 0 ? Math.max(...validValues) : sorted[sorted.length - 1]
  
  return {
    min,
    q1,
    median,
    q3,
    max,
    outliers,
    mean,
    iqr,
    lowerFence,
    upperFence,
    std,
    count: n
  }
}

export function ViolinPlot({
  data,
  labelKey,
  valueKey,
  valuesKey,
  labelAccessor,
  valueAccessor,
  mapping,
  width = 600,
  height = 500,
  margin = { top: 20, right: 60, bottom: 60, left: 60 },
  orientation = 'vertical',
  violinWidth = 80,
  bandwidth,
  resolution = 100,
  showBoxPlot = true,
  boxPlotWidth = 15,
  showMedian = true,
  showMean = true,
  showQuartiles = true,
  showOutliers = true,
  kdeMethod = 'gaussian',
  smoothing = 1,
  clipMin,
  clipMax,
  colors = DEFAULT_COLORS,
  colorScheme = 'custom',
  violinFillOpacity = 0.7,
  violinStroke = '#374151',
  violinStrokeWidth = 1,
  boxPlotStroke = '#374151',
  boxPlotStrokeWidth = 2,
  medianStroke = '#000',
  medianStrokeWidth = 3,
  showLabels = true,
  showValues = false,
  showStatistics = false,
  labelPosition = 'outside',
  valueFormat,
  statisticsFormat,
  fontSize = 12,
  fontFamily = 'sans-serif',
  animate = true,
  animationDuration = 1000,
  animationDelay = 100,
  animationEasing = 'easeOutCubic',
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  onViolinClick,
  onViolinHover,
  className,
  style,
  ...props
}: ViolinPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedViolinDataPoint } | null>(null)
  const [hoveredViolin, setHoveredViolin] = useState<number | null>(null)

  // 計算尺寸
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // 資料處理
  const processedData = useMemo((): ProcessedViolinDataPoint[] => {
    if (!data?.length) return []

    const processed = data.map((d, index) => {
      let label: string, values: number[]

      if (mapping) {
        label = typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label])
        values = typeof mapping.values === 'function' ? mapping.values(d) : d[mapping.values] || []
      } else if (labelAccessor && valueAccessor) {
        label = labelAccessor(d)
        values = valueAccessor(d)
      } else if (labelKey && valuesKey) {
        label = String(d[labelKey])
        values = Array.isArray(d[valuesKey]) ? d[valuesKey] : []
      } else if (labelKey && valueKey) {
        // 假設每一行是一個值，需要分組
        label = String(d[labelKey])
        values = [Number(d[valueKey]) || 0]
      } else {
        // 自動偵測：假設第一個欄位是 label，其他數值欄位是 values
        const keys = Object.keys(d)
        label = String(d[keys[0]])
        values = keys.slice(1).map(key => Number(d[key]) || 0).filter(val => !isNaN(val))
      }

      // 過濾無效數值
      values = values.filter(val => typeof val === 'number' && !isNaN(val))

      if (values.length === 0) {
        return null
      }

      const statistics = calculateViolinStatistics(values)
      
      // 計算自動帶寬（Silverman's rule of thumb）
      const autoBandwidth = bandwidth || 1.06 * statistics.std! * Math.pow(values.length, -1/5)
      
      const densityData = kernelDensityEstimation(
        values, 
        autoBandwidth * smoothing, 
        resolution, 
        kdeMethod,
        clipMin,
        clipMax
      )

      return {
        label,
        values,
        statistics,
        densityData,
        originalData: d,
        index
      } as ProcessedViolinDataPoint
    }).filter(d => d !== null) as ProcessedViolinDataPoint[]

    return processed
  }, [data, labelKey, valueKey, valuesKey, labelAccessor, valueAccessor, mapping, bandwidth, resolution, kdeMethod, smoothing, clipMin, clipMax])

  // 顏色比例尺
  const colorScale = useMemo(() => {
    if (colorScheme !== 'custom') {
      const schemes = {
        blues: d3.interpolateBlues,
        greens: d3.interpolateGreens,
        oranges: d3.interpolateOranges,
        reds: d3.interpolateReds,
        purples: d3.interpolatePurples
      }
      return d3.scaleSequential(schemes[colorScheme])
        .domain([0, processedData.length - 1])
    }
    
    return d3.scaleOrdinal(colors)
      .domain(processedData.map((d, i) => i.toString()))
  }, [colors, colorScheme, processedData])

  // 比例尺
  const scales = useMemo(() => {
    if (!processedData.length) return null

    // 找出所有數值的範圍
    const allValues = processedData.flatMap(d => d.values)
    const valueExtent = d3.extent(allValues) as [number, number]

    // 找出最大密度值（用於標準化小提琴寬度）
    const maxDensity = Math.max(...processedData.flatMap(d => d.densityData.map(p => p.density)))

    if (orientation === 'vertical') {
      const xScale = d3.scaleBand()
        .domain(processedData.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.2)

      const yScale = d3.scaleLinear()
        .domain(valueExtent)
        .nice()
        .range([chartHeight, 0])

      const densityScale = d3.scaleLinear()
        .domain([0, maxDensity])
        .range([0, violinWidth / 2])

      return { xScale, yScale, colorScale, densityScale }
    } else {
      const xScale = d3.scaleLinear()
        .domain(valueExtent)
        .nice()
        .range([0, chartWidth])

      const yScale = d3.scaleBand()
        .domain(processedData.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.2)

      const densityScale = d3.scaleLinear()
        .domain([0, maxDensity])
        .range([0, violinWidth / 2])

      return { xScale, yScale, colorScale, densityScale }
    }
  }, [processedData, chartWidth, chartHeight, orientation, violinWidth, colorScale])

  // 小提琴形狀資料
  const violins = useMemo((): ViolinShape[] => {
    if (!processedData.length || !scales) return []

    return processedData.map((d, i) => {
      const { statistics, densityData } = d
      const color = typeof colorScale === 'function' ? colorScale(i) : colorScale(i.toString())

      if (orientation === 'vertical') {
        const xScale = scales.xScale as d3.ScaleBand<string>
        const yScale = scales.yScale as d3.ScaleLinear<number, number>
        const densityScale = scales.densityScale as d3.ScaleLinear<number, number>
        
        const centerX = (xScale(d.label) || 0) + xScale.bandwidth() / 2
        const x = centerX - violinWidth / 2
        const y = yScale(Math.max(...d.values))
        const width = violinWidth
        const height = yScale(Math.min(...d.values)) - yScale(Math.max(...d.values))

        // 生成小提琴路徑
        const leftPoints = densityData.map(p => [
          centerX - densityScale(p.density),
          yScale(p.value)
        ] as [number, number])

        const rightPoints = densityData.map(p => [
          centerX + densityScale(p.density),
          yScale(p.value)
        ] as [number, number])

        // 創建對稱的小提琴形狀
        const allPoints = [...leftPoints, ...rightPoints.reverse()]
        const violinPath = d3.line()(allPoints) || ''

        return {
          label: d.label,
          statistics,
          densityData,
          x,
          y,
          width,
          height,
          color,
          violinPath,
          index: i
        }
      } else {
        const xScale = scales.xScale as d3.ScaleLinear<number, number>
        const yScale = scales.yScale as d3.ScaleBand<string>
        const densityScale = scales.densityScale as d3.ScaleLinear<number, number>
        
        const centerY = (yScale(d.label) || 0) + yScale.bandwidth() / 2
        const x = xScale(Math.min(...d.values))
        const y = centerY - violinWidth / 2
        const width = xScale(Math.max(...d.values)) - xScale(Math.min(...d.values))
        const height = violinWidth

        // 生成橫向小提琴路徑
        const topPoints = densityData.map(p => [
          xScale(p.value),
          centerY - densityScale(p.density)
        ] as [number, number])

        const bottomPoints = densityData.map(p => [
          xScale(p.value),
          centerY + densityScale(p.density)
        ] as [number, number])

        // 創建對稱的小提琴形狀
        const allPoints = [...topPoints, ...bottomPoints.reverse()]
        const violinPath = d3.line()(allPoints) || ''

        return {
          label: d.label,
          statistics,
          densityData,
          x,
          y,
          width,
          height,
          color,
          violinPath,
          index: i
        }
      }
    })
  }, [processedData, scales, orientation, violinWidth, colorScale])

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current || !violins.length || !scales) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // 繪製坐標軸
    if (orientation === 'vertical') {
      const xScale = scales.xScale as d3.ScaleBand<string>
      const yScale = scales.yScale as d3.ScaleLinear<number, number>

      // X軸
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale))

      // Y軸
      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale))
    } else {
      const xScale = scales.xScale as d3.ScaleLinear<number, number>
      const yScale = scales.yScale as d3.ScaleBand<string>

      // X軸
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale))

      // Y軸
      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale))
    }

    // 繪製小提琴形狀
    const violinGroups = g.selectAll('.violin-group')
      .data(violins)
      .enter()
      .append('g')
      .attr('class', 'violin-group')

    const violinPaths = violinGroups.append('path')
      .attr('class', 'violin-path')
      .attr('d', d => d.violinPath)
      .attr('fill', d => d.color)
      .attr('fill-opacity', violinFillOpacity)
      .attr('stroke', violinStroke)
      .attr('stroke-width', violinStrokeWidth)
      .style('cursor', interactive ? 'pointer' : 'default')

    // 繪製箱形圖
    if (showBoxPlot) {
      violinGroups.each(function(d) {
        const group = d3.select(this)
        const { statistics } = d

        if (orientation === 'vertical') {
          const xScale = scales.xScale as d3.ScaleBand<string>
          const yScale = scales.yScale as d3.ScaleLinear<number, number>
          const centerX = (xScale(d.label) || 0) + xScale.bandwidth() / 2

          // 箱體
          if (showQuartiles) {
            group.append('rect')
              .attr('class', 'box-rect')
              .attr('x', centerX - boxPlotWidth / 2)
              .attr('y', yScale(statistics.q3))
              .attr('width', boxPlotWidth)
              .attr('height', yScale(statistics.q1) - yScale(statistics.q3))
              .attr('fill', 'white')
              .attr('fill-opacity', 0.8)
              .attr('stroke', boxPlotStroke)
              .attr('stroke-width', boxPlotStrokeWidth)
          }

          // 中位數線
          if (showMedian) {
            group.append('line')
              .attr('class', 'median-line')
              .attr('x1', centerX - boxPlotWidth / 2)
              .attr('x2', centerX + boxPlotWidth / 2)
              .attr('y1', yScale(statistics.median))
              .attr('y2', yScale(statistics.median))
              .attr('stroke', medianStroke)
              .attr('stroke-width', medianStrokeWidth)
          }

          // 平均值
          if (showMean && statistics.mean !== undefined) {
            group.append('circle')
              .attr('class', 'mean-marker')
              .attr('cx', centerX)
              .attr('cy', yScale(statistics.mean))
              .attr('r', 3)
              .attr('fill', 'white')
              .attr('stroke', boxPlotStroke)
              .attr('stroke-width', boxPlotStrokeWidth)
          }

          // 異常值
          if (showOutliers) {
            statistics.outliers.forEach(outlier => {
              group.append('circle')
                .attr('class', 'outlier')
                .attr('cx', centerX + (Math.random() - 0.5) * boxPlotWidth)
                .attr('cy', yScale(outlier))
                .attr('r', 2)
                .attr('fill', d.color)
                .attr('fill-opacity', 0.6)
                .attr('stroke', boxPlotStroke)
                .attr('stroke-width', 1)
            })
          }
        } else {
          const xScale = scales.xScale as d3.ScaleLinear<number, number>
          const yScale = scales.yScale as d3.ScaleBand<string>
          const centerY = (yScale(d.label) || 0) + yScale.bandwidth() / 2

          // 箱體
          if (showQuartiles) {
            group.append('rect')
              .attr('class', 'box-rect')
              .attr('x', xScale(statistics.q1))
              .attr('y', centerY - boxPlotWidth / 2)
              .attr('width', xScale(statistics.q3) - xScale(statistics.q1))
              .attr('height', boxPlotWidth)
              .attr('fill', 'white')
              .attr('fill-opacity', 0.8)
              .attr('stroke', boxPlotStroke)
              .attr('stroke-width', boxPlotStrokeWidth)
          }

          // 中位數線
          if (showMedian) {
            group.append('line')
              .attr('class', 'median-line')
              .attr('x1', xScale(statistics.median))
              .attr('x2', xScale(statistics.median))
              .attr('y1', centerY - boxPlotWidth / 2)
              .attr('y2', centerY + boxPlotWidth / 2)
              .attr('stroke', medianStroke)
              .attr('stroke-width', medianStrokeWidth)
          }

          // 平均值
          if (showMean && statistics.mean !== undefined) {
            group.append('circle')
              .attr('class', 'mean-marker')
              .attr('cx', xScale(statistics.mean))
              .attr('cy', centerY)
              .attr('r', 3)
              .attr('fill', 'white')
              .attr('stroke', boxPlotStroke)
              .attr('stroke-width', boxPlotStrokeWidth)
          }

          // 異常值
          if (showOutliers) {
            statistics.outliers.forEach(outlier => {
              group.append('circle')
                .attr('class', 'outlier')
                .attr('cx', xScale(outlier))
                .attr('cy', centerY + (Math.random() - 0.5) * boxPlotWidth)
                .attr('r', 2)
                .attr('fill', d.color)
                .attr('fill-opacity', 0.6)
                .attr('stroke', boxPlotStroke)
                .attr('stroke-width', 1)
            })
          }
        }
      })
    }

    // 動畫效果
    if (animate) {
      violinPaths
        .style('opacity', 0)
        .attr('transform', 'scale(0.8)')
        .transition()
        .duration(animationDuration)
        .delay((d, i) => i * animationDelay)
        .ease(d3.easeQuadOut)
        .style('opacity', 1)
        .attr('transform', 'scale(1)')
    }

    // 互動事件
    if (interactive) {
      violinGroups
        .on('mouseenter', function(event, d) {
          d3.select(this).select('.violin-path')
            .transition()
            .duration(200)
            .style('opacity', 0.8)
            .attr('transform', 'scale(1.02)')

          setHoveredViolin(d.index)
          
          if (showTooltip) {
            setTooltip({
              x: 0,
              y: 0,
              data: processedData[d.index]
            })
          }
          
          onViolinHover?.(processedData[d.index])
        })
        .on('mouseleave', function() {
          d3.select(this).select('.violin-path')
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('transform', 'scale(1)')

          setHoveredViolin(null)
          setTooltip(null)
          onViolinHover?.(null)
        })
        .on('click', function(event, d) {
          onViolinClick?.(processedData[d.index])
        })
    }

  }, [
    violins, scales, chartWidth, chartHeight, margin, orientation, violinWidth,
    showBoxPlot, boxPlotWidth, showMedian, showMean, showQuartiles, showOutliers,
    violinFillOpacity, violinStroke, violinStrokeWidth, boxPlotStroke, boxPlotStrokeWidth,
    medianStroke, medianStrokeWidth, animate, animationDuration, animationDelay, interactive, processedData
  ])

  if (!data?.length) {
    return (
      <div className={cn('violin-plot-container', className)} style={style} {...props}>
        <div className="empty-state text-center py-8">
          <p className="text-gray-500">無資料可顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('violin-plot-container relative', className)}
      style={style}
      {...props}
    >
      {/* 主要圖表 */}
      <div className="chart-area relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="violin-plot-svg"
        />
        
        {/* 工具提示 */}
        {tooltip && showTooltip && (
          <div
            className="absolute z-10 px-3 py-2 text-sm bg-gray-800 text-white rounded shadow-lg pointer-events-none"
            style={{
              top: 10,
              right: 10,
              maxWidth: '200px'
            }}
          >
            {tooltipFormat ? tooltipFormat(tooltip.data) : (
              <div>
                <div className="font-semibold">{tooltip.data.label}</div>
                <div>樣本數: {tooltip.data.statistics.count}</div>
                <div>中位數: {tooltip.data.statistics.median.toFixed(2)}</div>
                {tooltip.data.statistics.mean && (
                  <div>平均值: {tooltip.data.statistics.mean.toFixed(2)}</div>
                )}
                {tooltip.data.statistics.std && (
                  <div>標準差: {tooltip.data.statistics.std.toFixed(2)}</div>
                )}
                <div>異常值: {tooltip.data.statistics.outliers.length}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}