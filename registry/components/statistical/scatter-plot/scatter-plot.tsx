import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { ScatterPlotProps, ProcessedDataPoint } from './types'

export function ScatterPlot({
  data,
  xKey,
  yKey,
  xAccessor,
  yAccessor,
  mapping,
  sizeKey,
  sizeAccessor,
  colorKey,
  colorAccessor,
  groupKey,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  radius = 4,
  minRadius = 3,
  maxRadius = 12,
  sizeRange = [3, 12],
  opacity = 0.7,
  strokeWidth = 1,
  strokeColor = 'white',
  showTrendline = false,
  trendlineColor = '#ef4444',
  trendlineWidth = 2,
  showTooltip = true,
  tooltipFormat,
  enableZoom = false,
  animate = false,
  interactive = true,
  className,
  onDataClick,
  onHover,
  ...props
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedDataPoint } | null>(null)

  // 1. 資料處理
  const { processedData, xScale, yScale, sizeScale, colorScale } = useMemo(() => {
    if (!data?.length) return { processedData: [], xScale: null, yScale: null, sizeScale: null, colorScale: null }

    // 處理資料映射
    const processed = data.map((d, index) => {
      let x: any, y: any, size: any, color: any

      if (mapping) {
        x = typeof mapping.x === 'function' ? mapping.x(d) : d[mapping.x]
        y = typeof mapping.y === 'function' ? mapping.y(d) : d[mapping.y]
        size = mapping.size ? (typeof mapping.size === 'function' ? mapping.size(d) : d[mapping.size]) : undefined
        color = mapping.color ? (typeof mapping.color === 'function' ? mapping.color(d) : d[mapping.color]) : undefined
      } else {
        x = xAccessor ? xAccessor(d) : (xKey ? d[xKey] : Object.values(d)[0])
        y = yAccessor ? yAccessor(d) : (yKey ? d[yKey] : Object.values(d)[1])
        size = sizeAccessor ? sizeAccessor(d) : (sizeKey ? d[sizeKey] : undefined)
        color = colorAccessor ? colorAccessor(d) : (colorKey ? d[colorKey] : (groupKey ? d[groupKey] : undefined))
      }

      return {
        x: Number(x) || 0,
        y: Number(y) || 0,
        size: size !== undefined ? Number(size) : undefined,
        color: color,
        originalData: d
      }
    })

    // 計算比例尺
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // X 軸比例尺
    const xDomain = d3.extent(processed, d => d.x) as [number, number]
    const xPadding = (xDomain[1] - xDomain[0]) * 0.05
    const xScale = d3.scaleLinear()
      .domain([xDomain[0] - xPadding, xDomain[1] + xPadding])
      .range([0, innerWidth])

    // Y 軸比例尺
    const yDomain = d3.extent(processed, d => d.y) as [number, number]
    const yPadding = (yDomain[1] - yDomain[0]) * 0.05
    const yScale = d3.scaleLinear()
      .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
      .range([innerHeight, 0])

    // 大小比例尺
    let sizeScale = null
    if (processed.some(d => d.size !== undefined)) {
      const sizeDomain = d3.extent(processed, d => d.size) as [number, number]
      sizeScale = d3.scaleSqrt()
        .domain(sizeDomain)
        .range(sizeRange)
    }

    // 顏色比例尺
    let colorScale = null
    if (processed.some(d => d.color !== undefined)) {
      const colorValues = [...new Set(processed.map(d => d.color).filter(c => c !== undefined))]
      if (typeof processed[0]?.color === 'number') {
        // 連續顏色比例尺
        const colorDomain = d3.extent(processed, d => d.color) as [number, number]
        colorScale = d3.scaleSequential(d3.interpolateBlues).domain(colorDomain)
      } else {
        // 離散顏色比例尺
        colorScale = d3.scaleOrdinal()
          .domain(colorValues)
          .range(colors)
      }
    }

    return { processedData: processed, xScale, yScale, sizeScale, colorScale }
  }, [data, xKey, yKey, xAccessor, yAccessor, mapping, sizeKey, sizeAccessor, colorKey, colorAccessor, groupKey, width, height, margin, colors, sizeRange])

  // 2. 趨勢線計算
  const trendlineData = useMemo(() => {
    if (!showTrendline || !processedData.length || !xScale || !yScale) return null

    // 簡單線性回歸
    const n = processedData.length
    const sumX = processedData.reduce((sum, d) => sum + d.x, 0)
    const sumY = processedData.reduce((sum, d) => sum + d.y, 0)
    const sumXY = processedData.reduce((sum, d) => sum + d.x * d.y, 0)
    const sumXX = processedData.reduce((sum, d) => sum + d.x * d.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const xDomain = xScale.domain()
    return [
      { x: xDomain[0], y: slope * xDomain[0] + intercept },
      { x: xDomain[1], y: slope * xDomain[1] + intercept }
    ]
  }, [showTrendline, processedData, xScale, yScale])

  // 3. D3 渲染
  useEffect(() => {
    if (!svgRef.current || !xScale || !yScale) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // 建立主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 背景
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('stroke', 'none')

    // 網格線
    g.append('g')
      .attr('class', 'grid-x')
      .selectAll('line')
      .data(xScale.ticks())
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.2)

    g.append('g')
      .attr('class', 'grid-y')
      .selectAll('line')
      .data(yScale.ticks())
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.2)

    // 趨勢線
    if (trendlineData) {
      const line = d3.line<{x: number, y: number}>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))

      g.append('path')
        .datum(trendlineData)
        .attr('class', 'trendline')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', trendlineColor)
        .attr('stroke-width', trendlineWidth)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.8)
    }

    // 資料點
    const circles = g.selectAll('.dot')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => {
        if (sizeScale && d.size !== undefined) {
          return sizeScale(d.size)
        }
        return radius
      })
      .attr('fill', d => {
        if (colorScale && d.color !== undefined) {
          return colorScale(d.color)
        }
        return colors[0]
      })
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', animate ? 0 : opacity)

    // 動畫
    if (animate) {
      circles
        .transition()
        .delay((d, i) => i * 10)
        .duration(500)
        .attr('opacity', opacity)
        .attr('r', d => {
          if (sizeScale && d.size !== undefined) {
            return sizeScale(d.size)
          }
          return radius
        })
    }

    // 互動
    if (interactive) {
      circles
        .style('cursor', 'pointer')
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', (originalR: number) => originalR * 1.2)
            .attr('opacity', 1)
          
          if (showTooltip) {
            setTooltip({ 
              x: 0, 
              y: 0, 
              data: d 
            })
          }
          
          onHover?.(d.originalData)
        })
        .on('mouseleave', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', () => {
              if (sizeScale && d.size !== undefined) {
                return sizeScale(d.size)
              }
              return radius
            })
            .attr('opacity', opacity)
          
          setTooltip(null)
        })
        .on('click', function(event, d) {
          onDataClick?.(d.originalData)
        })
    }

    // X 軸
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // Y 軸
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // 軸線樣式
    g.selectAll('.domain')
      .style('stroke', '#d1d5db')
    g.selectAll('.tick line')
      .style('stroke', '#d1d5db')

  }, [
    processedData, xScale, yScale, sizeScale, colorScale, trendlineData,
    width, height, margin, colors, radius, opacity, strokeWidth, strokeColor,
    showTrendline, trendlineColor, trendlineWidth, animate, interactive,
    onDataClick, onHover, showTooltip
  ])

  return (
    <div 
      ref={containerRef} 
      className={cn("relative", className)} 
      onMouseLeave={() => setTooltip(null)}
      {...props}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
      
      {/* 工具提示 */}
      {tooltip && showTooltip && (
        <div
          className="absolute z-10 px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            top: 10,
            right: 10
          }}
        >
          {tooltipFormat ? tooltipFormat(tooltip.data) : (
            <div>
              <div>X: {tooltip.data.x.toFixed(2)}</div>
              <div>Y: {tooltip.data.y.toFixed(2)}</div>
              {tooltip.data.size !== undefined && <div>Size: {tooltip.data.size.toFixed(2)}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ScatterPlot