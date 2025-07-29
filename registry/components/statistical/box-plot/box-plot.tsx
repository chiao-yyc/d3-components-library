import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { BoxPlotProps, ProcessedBoxPlotDataPoint, BoxPlotBox, BoxPlotStatistics } from './types'

const DEFAULT_COLORS = [
  '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554',
  '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'
]

// 計算箱形圖統計數據
function calculateBoxPlotStatistics(values: number[], method: string = 'standard'): BoxPlotStatistics {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  
  if (n === 0) {
    return {
      min: 0, q1: 0, median: 0, q3: 0, max: 0,
      outliers: [], iqr: 0, lowerFence: 0, upperFence: 0
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
  
  // 計算上下界限
  let lowerFence: number, upperFence: number
  if (method === 'tukey') {
    lowerFence = q1 - 1.5 * iqr
    upperFence = q3 + 1.5 * iqr
  } else {
    lowerFence = Math.min(...sorted)
    upperFence = Math.max(...sorted)
  }
  
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
    upperFence
  }
}

export function BoxPlot({
  data,
  labelKey,
  valueKey,
  valuesKey,
  labelAccessor,
  valueAccessor,
  mapping,
  width = 500,
  height = 400,
  margin = { top: 20, right: 60, bottom: 60, left: 60 },
  orientation = 'vertical',
  boxWidth = 40,
  whiskerWidth = 20,
  showOutliers = true,
  showMean = true,
  showMedian = true,
  outlierRadius = 3,
  meanStyle = 'diamond',
  colors = DEFAULT_COLORS,
  colorScheme = 'custom',
  boxFillOpacity = 0.7,
  boxStroke = '#374151',
  boxStrokeWidth = 1,
  statisticsMethod = 'tukey',
  outlierThreshold = 1.5,
  showQuartiles = true,
  showWhiskers = true,
  showLabels = true,
  showValues = false,
  showStatistics = false,
  labelPosition = 'outside',
  valueFormat,
  statisticsFormat,
  fontSize = 12,
  fontFamily = 'sans-serif',
  animate = true,
  animationDuration = 800,
  animationDelay = 100,
  animationEasing = 'easeOutCubic',
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  onBoxClick,
  onBoxHover,
  className,
  style,
  ...props
}: BoxPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedBoxPlotDataPoint } | null>(null)
  const [hoveredBox, setHoveredBox] = useState<number | null>(null)

  // 計算尺寸
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // 資料處理
  const processedData = useMemo((): ProcessedBoxPlotDataPoint[] => {
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

      const statistics = calculateBoxPlotStatistics(values, statisticsMethod)

      return {
        label,
        values,
        statistics,
        originalData: d,
        index
      } as ProcessedBoxPlotDataPoint
    }).filter(d => d.values.length > 0) // 過濾沒有有效數據的項目

    return processed
  }, [data, labelKey, valueKey, valuesKey, labelAccessor, valueAccessor, mapping, statisticsMethod])

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
    const allValues = processedData.flatMap(d => [
      d.statistics.min,
      d.statistics.max,
      ...d.statistics.outliers
    ])
    const valueExtent = d3.extent(allValues) as [number, number]

    if (orientation === 'vertical') {
      const xScale = d3.scaleBand()
        .domain(processedData.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.2)

      const yScale = d3.scaleLinear()
        .domain(valueExtent)
        .nice()
        .range([chartHeight, 0])

      return { xScale, yScale, colorScale }
    } else {
      const xScale = d3.scaleLinear()
        .domain(valueExtent)
        .nice()
        .range([0, chartWidth])

      const yScale = d3.scaleBand()
        .domain(processedData.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.2)

      return { xScale, yScale, colorScale }
    }
  }, [processedData, chartWidth, chartHeight, orientation, colorScale])

  // 箱形圖資料
  const boxes = useMemo((): BoxPlotBox[] => {
    if (!processedData.length || !scales) return []

    return processedData.map((d, i) => {
      const { statistics } = d
      const color = typeof colorScale === 'function' ? colorScale(i) : colorScale(i.toString())

      if (orientation === 'vertical') {
        const xScale = scales.xScale as d3.ScaleBand<string>
        const yScale = scales.yScale as d3.ScaleLinear<number, number>
        
        const x = (xScale(d.label) || 0) + (xScale.bandwidth() - boxWidth) / 2
        const y = yScale(statistics.q3)
        const width = boxWidth
        const height = yScale(statistics.q1) - yScale(statistics.q3)

        return {
          label: d.label,
          statistics,
          x,
          y,
          width,
          height,
          color,
          index: i
        }
      } else {
        const xScale = scales.xScale as d3.ScaleLinear<number, number>
        const yScale = scales.yScale as d3.ScaleBand<string>
        
        const x = xScale(statistics.q1)
        const y = (yScale(d.label) || 0) + (yScale.bandwidth() - boxWidth) / 2
        const width = xScale(statistics.q3) - xScale(statistics.q1)
        const height = boxWidth

        return {
          label: d.label,
          statistics,
          x,
          y,
          width,
          height,
          color,
          index: i
        }
      }
    })
  }, [processedData, scales, orientation, boxWidth, colorScale])

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current || !boxes.length || !scales) return

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

    // 繪製箱形圖
    const boxGroups = g.selectAll('.box-plot-group')
      .data(boxes)
      .enter()
      .append('g')
      .attr('class', 'box-plot-group')

    // 繪製whiskers
    if (showWhiskers) {
      boxGroups.each(function(d) {
        const group = d3.select(this)
        const { statistics } = d

        if (orientation === 'vertical') {
          const yScale = scales.yScale as d3.ScaleLinear<number, number>
          const centerX = d.x + d.width / 2

          // 上whisker
          group.append('line')
            .attr('class', 'whisker-upper')
            .attr('x1', centerX)
            .attr('x2', centerX)
            .attr('y1', yScale(statistics.q3))
            .attr('y2', yScale(statistics.max))
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth)

          // 下whisker
          group.append('line')
            .attr('class', 'whisker-lower')
            .attr('x1', centerX)
            .attr('x2', centerX)
            .attr('y1', yScale(statistics.q1))
            .attr('y2', yScale(statistics.min))
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth)

          // whisker端點
          group.append('line')
            .attr('class', 'whisker-cap-upper')
            .attr('x1', centerX - whiskerWidth / 2)
            .attr('x2', centerX + whiskerWidth / 2)
            .attr('y1', yScale(statistics.max))
            .attr('y2', yScale(statistics.max))
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth)

          group.append('line')
            .attr('class', 'whisker-cap-lower')
            .attr('x1', centerX - whiskerWidth / 2)
            .attr('x2', centerX + whiskerWidth / 2)
            .attr('y1', yScale(statistics.min))
            .attr('y2', yScale(statistics.min))
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth)
        } else {
          const xScale = scales.xScale as d3.ScaleLinear<number, number>
          const centerY = d.y + d.height / 2

          // 右whisker
          group.append('line')
            .attr('class', 'whisker-upper')
            .attr('x1', xScale(statistics.q3))
            .attr('x2', xScale(statistics.max))
            .attr('y1', centerY)
            .attr('y2', centerY)
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth)

          // 左whisker
          group.append('line')
            .attr('class', 'whisker-lower')
            .attr('x1', xScale(statistics.q1))
            .attr('x2', xScale(statistics.min))
            .attr('y1', centerY)
            .attr('y2', centerY)
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth)

          // whisker端點
          group.append('line')
            .attr('class', 'whisker-cap-upper')
            .attr('x1', xScale(statistics.max))
            .attr('x2', xScale(statistics.max))
            .attr('y1', centerY - whiskerWidth / 2)
            .attr('y2', centerY + whiskerWidth / 2)
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth)

          group.append('line')
            .attr('class', 'whisker-cap-lower')
            .attr('x1', xScale(statistics.min))
            .attr('x2', xScale(statistics.min))
            .attr('y1', centerY - whiskerWidth / 2)
            .attr('y2', centerY + whiskerWidth / 2)
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth)
        }
      })
    }

    // 繪製箱體
    const boxRects = boxGroups.append('rect')
      .attr('class', 'box-rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('fill', d => d.color)
      .attr('fill-opacity', boxFillOpacity)
      .attr('stroke', boxStroke)
      .attr('stroke-width', boxStrokeWidth)
      .style('cursor', interactive ? 'pointer' : 'default')

    // 繪製中位數線
    if (showMedian) {
      boxGroups.each(function(d) {
        const group = d3.select(this)
        const { statistics } = d

        if (orientation === 'vertical') {
          const yScale = scales.yScale as d3.ScaleLinear<number, number>
          
          group.append('line')
            .attr('class', 'median-line')
            .attr('x1', d.x)
            .attr('x2', d.x + d.width)
            .attr('y1', yScale(statistics.median))
            .attr('y2', yScale(statistics.median))
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth + 1)
        } else {
          const xScale = scales.xScale as d3.ScaleLinear<number, number>
          
          group.append('line')
            .attr('class', 'median-line')
            .attr('x1', xScale(statistics.median))
            .attr('x2', xScale(statistics.median))
            .attr('y1', d.y)
            .attr('y2', d.y + d.height)
            .attr('stroke', boxStroke)
            .attr('stroke-width', boxStrokeWidth + 1)
        }
      })
    }

    // 繪製平均值
    if (showMean && processedData.every(d => d.statistics.mean !== undefined)) {
      boxGroups.each(function(d) {
        const group = d3.select(this)
        const { statistics } = d
        
        if (statistics.mean === undefined) return

        if (orientation === 'vertical') {
          const yScale = scales.yScale as d3.ScaleLinear<number, number>
          const centerX = d.x + d.width / 2
          
          if (meanStyle === 'diamond') {
            const size = 6
            group.append('path')
              .attr('class', 'mean-marker')
              .attr('d', `M ${centerX} ${yScale(statistics.mean) - size} L ${centerX + size} ${yScale(statistics.mean)} L ${centerX} ${yScale(statistics.mean) + size} L ${centerX - size} ${yScale(statistics.mean)} Z`)
              .attr('fill', '#fff')
              .attr('stroke', boxStroke)
              .attr('stroke-width', boxStrokeWidth)
          } else if (meanStyle === 'circle') {
            group.append('circle')
              .attr('class', 'mean-marker')
              .attr('cx', centerX)
              .attr('cy', yScale(statistics.mean))
              .attr('r', 4)
              .attr('fill', '#fff')
              .attr('stroke', boxStroke)
              .attr('stroke-width', boxStrokeWidth)
          } else {
            group.append('rect')
              .attr('class', 'mean-marker')
              .attr('x', centerX - 4)
              .attr('y', yScale(statistics.mean) - 4)
              .attr('width', 8)
              .attr('height', 8)
              .attr('fill', '#fff')
              .attr('stroke', boxStroke)
              .attr('stroke-width', boxStrokeWidth)
          }
        } else {
          const xScale = scales.xScale as d3.ScaleLinear<number, number>
          const centerY = d.y + d.height / 2
          
          if (meanStyle === 'diamond') {
            const size = 6
            group.append('path')
              .attr('class', 'mean-marker')
              .attr('d', `M ${xScale(statistics.mean) - size} ${centerY} L ${xScale(statistics.mean)} ${centerY - size} L ${xScale(statistics.mean) + size} ${centerY} L ${xScale(statistics.mean)} ${centerY + size} Z`)
              .attr('fill', '#fff')
              .attr('stroke', boxStroke)
              .attr('stroke-width', boxStrokeWidth)
          } else if (meanStyle === 'circle') {
            group.append('circle')
              .attr('class', 'mean-marker')
              .attr('cx', xScale(statistics.mean))
              .attr('cy', centerY)
              .attr('r', 4)
              .attr('fill', '#fff')
              .attr('stroke', boxStroke)
              .attr('stroke-width', boxStrokeWidth)
          } else {
            group.append('rect')
              .attr('class', 'mean-marker')
              .attr('x', xScale(statistics.mean) - 4)
              .attr('y', centerY - 4)
              .attr('width', 8)
              .attr('height', 8)
              .attr('fill', '#fff')
              .attr('stroke', boxStroke)
              .attr('stroke-width', boxStrokeWidth)
          }
        }
      })
    }

    // 繪製異常值
    if (showOutliers) {
      boxGroups.each(function(d) {
        const group = d3.select(this)
        const { statistics } = d

        statistics.outliers.forEach(outlier => {
          if (orientation === 'vertical') {
            const yScale = scales.yScale as d3.ScaleLinear<number, number>
            const centerX = d.x + d.width / 2
            
            group.append('circle')
              .attr('class', 'outlier')
              .attr('cx', centerX + (Math.random() - 0.5) * (d.width * 0.6)) // 添加一些隨機偏移避免重疊
              .attr('cy', yScale(outlier))
              .attr('r', outlierRadius)
              .attr('fill', d.color)
              .attr('fill-opacity', 0.6)
              .attr('stroke', boxStroke)
              .attr('stroke-width', 1)
          } else {
            const xScale = scales.xScale as d3.ScaleLinear<number, number>
            const centerY = d.y + d.height / 2
            
            group.append('circle')
              .attr('class', 'outlier')
              .attr('cx', xScale(outlier))
              .attr('cy', centerY + (Math.random() - 0.5) * (d.height * 0.6))
              .attr('r', outlierRadius)
              .attr('fill', d.color)
              .attr('fill-opacity', 0.6)
              .attr('stroke', boxStroke)
              .attr('stroke-width', 1)
          }
        })
      })
    }

    // 動畫效果
    if (animate) {
      boxRects
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
      boxGroups
        .on('mouseenter', function(event, d) {
          d3.select(this).select('.box-rect')
            .transition()
            .duration(200)
            .style('opacity', 0.8)
            .attr('transform', 'scale(1.02)')

          setHoveredBox(d.index)
          
          if (showTooltip) {
            setTooltip({
              x: 0,
              y: 0,
              data: processedData[d.index]
            })
          }
          
          onBoxHover?.(processedData[d.index])
        })
        .on('mouseleave', function() {
          d3.select(this).select('.box-rect')
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('transform', 'scale(1)')

          setHoveredBox(null)
          setTooltip(null)
          onBoxHover?.(null)
        })
        .on('click', function(event, d) {
          onBoxClick?.(processedData[d.index])
        })
    }

  }, [
    boxes, scales, chartWidth, chartHeight, margin, orientation, boxWidth, whiskerWidth,
    showOutliers, showMean, showMedian, meanStyle, outlierRadius, boxFillOpacity,
    boxStroke, boxStrokeWidth, showQuartiles, showWhiskers, animate, animationDuration,
    animationDelay, interactive, processedData
  ])

  if (!data?.length) {
    return (
      <div className={cn('box-plot-container', className)} style={style} {...props}>
        <div className="empty-state text-center py-8">
          <p className="text-gray-500">無資料可顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('box-plot-container relative', className)}
      style={style}
      {...props}
    >
      {/* 主要圖表 */}
      <div className="chart-area relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="box-plot-svg"
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
                <div>Q1: {tooltip.data.statistics.q1.toFixed(2)}</div>
                <div>中位數: {tooltip.data.statistics.median.toFixed(2)}</div>
                <div>Q3: {tooltip.data.statistics.q3.toFixed(2)}</div>
                {tooltip.data.statistics.mean && (
                  <div>平均值: {tooltip.data.statistics.mean.toFixed(2)}</div>
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