import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'
import { HeatmapProps, ProcessedHeatmapDataPoint, LegendTick } from './types'

export function Heatmap({
  data,
  xKey,
  yKey,
  valueKey,
  xAccessor,
  yAccessor,
  valueAccessor,
  mapping,
  width = 600,
  height = 400,
  margin = { top: 20, right: 80, bottom: 60, left: 80 },
  cellPadding = 2,
  cellRadius = 0,
  colorScheme = 'blues',
  colors,
  domain,
  showXAxis = true,
  showYAxis = true,
  xAxisFormat,
  yAxisFormat,
  xAxisRotation = -45,
  yAxisRotation = 0,
  showLegend = true,
  legendPosition = 'right',
  legendTitle = '數值',
  legendFormat,
  showValues = false,
  valueFormat,
  textColor,
  interactive = true,
  animate = true,
  animationDuration = 750,
  showTooltip = true,
  tooltipFormat,
  onCellClick,
  onCellHover,
  className,
  style,
  ...props
}: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedHeatmapDataPoint } | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  // 計算圖表區域尺寸
  const chartWidth = useMemo(() => {
    return showLegend && (legendPosition === 'left' || legendPosition === 'right')
      ? width * 0.8 - margin.left - margin.right
      : width - margin.left - margin.right
  }, [width, margin, showLegend, legendPosition])

  const chartHeight = useMemo(() => {
    return showLegend && (legendPosition === 'top' || legendPosition === 'bottom')
      ? height * 0.8 - margin.top - margin.bottom
      : height - margin.top - margin.bottom
  }, [height, margin, showLegend, legendPosition])

  // 資料處理
  const processedData = useMemo(() => {
    if (!data?.length) return []

    const processed = data.map((d, index) => {
      let x: string | number, y: string | number, value: number

      if (mapping) {
        x = typeof mapping.x === 'function' ? mapping.x(d) : d[mapping.x]
        y = typeof mapping.y === 'function' ? mapping.y(d) : d[mapping.y]
        value = typeof mapping.value === 'function' ? mapping.value(d) : Number(d[mapping.value]) || 0
      } else if (xAccessor && yAccessor && valueAccessor) {
        x = xAccessor(d)
        y = yAccessor(d)
        value = valueAccessor(d)
      } else if (xKey && yKey && valueKey) {
        x = d[xKey]
        y = d[yKey]
        value = Number(d[valueKey]) || 0
      } else {
        // 自動偵測：假設前三個欄位分別是 x, y, value
        const keys = Object.keys(d)
        x = d[keys[0]]
        y = d[keys[1]]
        value = Number(d[keys[2]]) || 0
      }

      return {
        x: String(x),
        y: String(y),
        value,
        originalData: d,
        xIndex: 0, // 會在下面更新
        yIndex: 0, // 會在下面更新
        normalizedValue: 0 // 會在下面更新
      } as ProcessedHeatmapDataPoint
    }).filter(d => !isNaN(d.value)) // 過濾無效資料

    return processed
  }, [data, xKey, yKey, valueKey, xAccessor, yAccessor, valueAccessor, mapping])

  // 獲取唯一的 x 和 y 值
  const { xValues, yValues } = useMemo(() => {
    const xSet = new Set(processedData.map(d => d.x))
    const ySet = new Set(processedData.map(d => d.y))
    
    return {
      xValues: Array.from(xSet).sort(),
      yValues: Array.from(ySet).sort()
    }
  }, [processedData])

  // 建立完整的網格資料
  const gridData = useMemo(() => {
    if (!xValues.length || !yValues.length) return []

    // 建立資料映射以快速查找
    const dataMap = new Map()
    processedData.forEach(d => {
      dataMap.set(`${d.x}-${d.y}`, d)
    })

    // 計算值域範圍
    const values = processedData.map(d => d.value)
    const valueExtent = domain || d3.extent(values) as [number, number]
    const [minValue, maxValue] = valueExtent

    // 建立完整網格
    const grid: ProcessedHeatmapDataPoint[] = []
    
    yValues.forEach((y, yIndex) => {
      xValues.forEach((x, xIndex) => {
        const key = `${x}-${y}`
        const existing = dataMap.get(key)
        
        if (existing) {
          grid.push({
            ...existing,
            xIndex,
            yIndex,
            normalizedValue: (existing.value - minValue) / (maxValue - minValue)
          })
        } else {
          // 填入空值
          grid.push({
            x,
            y,
            value: 0,
            xIndex,
            yIndex,
            normalizedValue: 0,
            originalData: null
          })
        }
      })
    })

    return grid
  }, [processedData, xValues, yValues, domain])

  // 比例尺
  const scales = useMemo(() => {
    if (!xValues.length || !yValues.length) return null

    const cellWidth = chartWidth / xValues.length
    const cellHeight = chartHeight / yValues.length

    const xScale = d3.scaleBand()
      .domain(xValues)
      .range([0, chartWidth])
      .padding(cellPadding / cellWidth)

    const yScale = d3.scaleBand()
      .domain(yValues)
      .range([0, chartHeight])
      .padding(cellPadding / cellHeight)

    return { xScale, yScale, cellWidth, cellHeight }
  }, [xValues, yValues, chartWidth, chartHeight, cellPadding])

  // 顏色比例尺
  const colorScale = useMemo(() => {
    const values = processedData.map(d => d.value)
    const valueExtent = domain || d3.extent(values) as [number, number]

    if (colors) {
      return d3.scaleSequential()
        .domain(valueExtent)
        .interpolator(d3.interpolateRgbBasis(colors))
    }

    const schemes = {
      blues: d3.interpolateBlues,
      greens: d3.interpolateGreens,
      reds: d3.interpolateReds,
      oranges: d3.interpolateOranges,
      purples: d3.interpolatePurples,
      greys: d3.interpolateGreys
    }

    return d3.scaleSequential()
      .domain(valueExtent)
      .interpolator(schemes[colorScheme] || schemes.blues)
  }, [processedData, colorScheme, colors, domain])

  // 圖例資料
  const legendData = useMemo((): LegendTick[] => {
    if (!showLegend) return []

    const values = processedData.map(d => d.value)
    const valueExtent = domain || d3.extent(values) as [number, number]
    const [minValue, maxValue] = valueExtent

    const tickCount = 5
    const ticks = d3.range(tickCount).map(i => {
      const value = minValue + (maxValue - minValue) * (i / (tickCount - 1))
      return {
        value,
        position: i / (tickCount - 1),
        label: legendFormat ? legendFormat(value) : value.toFixed(1)
      }
    })

    return ticks
  }, [processedData, domain, showLegend, legendFormat])

  // D3 渲染
  useEffect(() => {
    if (!svgRef.current || !scales || !gridData.length) return

    const svg = d3.select(svgRef.current)
    const { xScale, yScale } = scales

    // 清除之前的內容
    svg.selectAll('*').remove()

    // 建立主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 繪製熱力圖格子
    const cells = g.selectAll('.heatmap-cell')
      .data(gridData)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', d => xScale(d.x) || 0)
      .attr('y', d => yScale(d.y) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', cellRadius)
      .attr('ry', cellRadius)
      .attr('fill', d => d.value === 0 ? '#f3f4f6' : colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', interactive ? 'pointer' : 'default')

    // 動畫效果
    if (animate) {
      cells
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration)
        .delay((d, i) => (i % xValues.length) * 50)
        .attr('opacity', 1)
    }

    // 顯示數值
    if (showValues) {
      const labels = g.selectAll('.heatmap-label')
        .data(gridData.filter(d => d.value !== 0))
        .enter()
        .append('text')
        .attr('class', 'heatmap-label')
        .attr('x', d => (xScale(d.x) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => (yScale(d.y) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', `${Math.min(xScale.bandwidth(), yScale.bandwidth()) / 4}px`)
        .style('fill', d => {
          if (typeof textColor === 'function') {
            return textColor(d.value, d.normalizedValue)
          }
          return textColor || (d.normalizedValue > 0.5 ? '#fff' : '#000')
        })
        .style('pointer-events', 'none')
        .text(d => valueFormat ? valueFormat(d.value) : d.value.toFixed(1))

      if (animate) {
        labels
          .attr('opacity', 0)
          .transition()
          .duration(animationDuration)
          .delay((d, i) => (i % xValues.length) * 50 + 200)
          .attr('opacity', 1)
      }
    }

    // 互動事件
    if (interactive) {
      cells
        .on('mouseenter', function(event, d) {
          if (d.value === 0) return

          d3.select(this)
            .transition()
            .duration(150)
            .attr('stroke-width', 3)
            .attr('stroke', '#374151')

          setHoveredCell(`${d.x}-${d.y}`)
          
          if (showTooltip) {
            setTooltip({
              x: (xScale(d.x) || 0) + xScale.bandwidth() / 2,
              y: (yScale(d.y) || 0),
              data: d
            })
          }
          
          onCellHover?.(d)
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(150)
            .attr('stroke-width', 1)
            .attr('stroke', '#fff')

          setHoveredCell(null)
          setTooltip(null)
          onCellHover?.(null)
        })
        .on('click', function(event, d) {
          if (d.value === 0) return
          onCellClick?.(d)
        })
    }

    // X 軸
    if (showXAxis) {
      const xAxis = d3.axisBottom(xScale)
      
      if (xAxisFormat) {
        xAxis.tickFormat(xAxisFormat)
      }

      const xAxisGroup = g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxis)

      if (xAxisRotation !== 0) {
        xAxisGroup.selectAll('text')
          .style('text-anchor', xAxisRotation < 0 ? 'end' : 'start')
          .attr('transform', `rotate(${xAxisRotation})`)
      }
    }

    // Y 軸
    if (showYAxis) {
      const yAxis = d3.axisLeft(yScale)
      
      if (yAxisFormat) {
        yAxis.tickFormat(yAxisFormat)
      }

      const yAxisGroup = g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)

      if (yAxisRotation !== 0) {
        yAxisGroup.selectAll('text')
          .attr('transform', `rotate(${yAxisRotation})`)
      }
    }

  }, [
    scales, gridData, margin, chartWidth, chartHeight, colorScale, xValues, yValues,
    cellRadius, animate, animationDuration, showValues, valueFormat, textColor,
    interactive, showXAxis, showYAxis, xAxisFormat, yAxisFormat, xAxisRotation, yAxisRotation,
    showTooltip, onCellClick, onCellHover
  ])

  if (!data?.length) {
    return (
      <div className={cn('heatmap-container', className)} style={style} {...props}>
        <div className="empty-state text-center py-8">
          <p className="text-gray-500">無資料可顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('heatmap-container relative flex', className)}
      style={style}
      {...props}
    >
      {/* 圖表 */}
      <div className="chart-area relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="heatmap-svg"
        />
        
        {/* 工具提示 */}
        {tooltip && showTooltip && (
          <div
            className="absolute z-10 px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              left: tooltip.x + margin.left,
              top: tooltip.y + margin.top - 40,
              transform: 'translateX(-50%)'
            }}
          >
            {tooltipFormat ? tooltipFormat(tooltip.data) : (
              <div>
                <div>X: {tooltip.data.x}</div>
                <div>Y: {tooltip.data.y}</div>
                <div>值: {tooltip.data.value}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 圖例 */}
      {showLegend && (
        <div className={cn(
          'legend',
          legendPosition === 'top' && 'order-first mb-4',
          legendPosition === 'bottom' && 'order-last mt-4',
          legendPosition === 'left' && 'order-first mr-4 flex-shrink-0',
          legendPosition === 'right' && 'order-last ml-4 flex-shrink-0'
        )}>
          <div className={cn(
            'legend-content',
            (legendPosition === 'top' || legendPosition === 'bottom') && 'flex items-center justify-center',
            (legendPosition === 'left' || legendPosition === 'right') && 'flex flex-col'
          )}>
            {legendTitle && (
              <div className={cn(
                'legend-title text-xs font-medium text-gray-700 mb-1',
                (legendPosition === 'top' || legendPosition === 'bottom') && 'mr-4 mb-0'
              )}>
                {legendTitle}
              </div>
            )}
            
            <div className={cn(
              'legend-scale',
              (legendPosition === 'top' || legendPosition === 'bottom') && 'flex items-center',
              (legendPosition === 'left' || legendPosition === 'right') && 'flex flex-col'
            )}>
              {/* 顏色條 */}
              <div 
                className="color-bar"
                style={{
                  width: (legendPosition === 'top' || legendPosition === 'bottom') ? '80px' : '12px',
                  height: (legendPosition === 'top' || legendPosition === 'bottom') ? '12px' : '80px'
                }}
              >
                <svg className="w-full h-full">
                  <defs>
                    <linearGradient 
                      id="legend-gradient" 
                      x1="0%" y1="0%" 
                      x2={legendPosition === 'left' || legendPosition === 'right' ? '0%' : '100%'} 
                      y2={legendPosition === 'left' || legendPosition === 'right' ? '100%' : '0%'}
                    >
                      {legendData.map((tick, i) => (
                        <stop 
                          key={i}
                          offset={`${tick.position * 100}%`}
                          stopColor={colorScale(tick.value)}
                        />
                      ))}
                    </linearGradient>
                  </defs>
                  <rect 
                    width="100%" 
                    height="100%" 
                    fill="url(#legend-gradient)"
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                </svg>
              </div>
              
              {/* 標籤 */}
              <div 
                className="legend-labels"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  ...(legendPosition === 'top' || legendPosition === 'bottom' 
                    ? { width: '80px', marginTop: '4px' }
                    : { flexDirection: 'column' as const, height: '80px', marginLeft: '4px' }
                  )
                }}
              >
                {legendData.map((tick, i) => (
                  <span 
                    key={i}
                    style={{
                      fontSize: '10px',
                      color: '#4b5563'
                    }}
                  >
                    {tick.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}