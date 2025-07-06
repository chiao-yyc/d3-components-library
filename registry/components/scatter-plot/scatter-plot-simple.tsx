import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'

export interface SimpleScatterPlotData {
  x: number
  y: number
  size?: number
  color?: string
  label?: string
}

export interface SimpleScatterPlotProps {
  data: SimpleScatterPlotData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colors?: string[]
  dotRadius?: number
  minRadius?: number
  maxRadius?: number
  showTrendLine?: boolean
  showGrid?: boolean
  xLabel?: string
  yLabel?: string
  className?: string
  onDotClick?: (data: SimpleScatterPlotData) => void
}

export function SimpleScatterPlot({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 50, left: 60 },
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  dotRadius = 5,
  minRadius = 3,
  maxRadius = 15,
  showTrendLine = false,
  showGrid = true,
  xLabel = 'X 軸',
  yLabel = 'Y 軸',
  className,
  onDotClick
}: SimpleScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: SimpleScatterPlotData } | null>(null)

  // 處理數據
  const processedData = useMemo(() => {
    if (!data?.length) return []

    return data.map((d, index) => ({
      ...d,
      x: Number(d.x) || 0,
      y: Number(d.y) || 0,
      size: d.size ? Number(d.size) : undefined,
      color: d.color || colors[index % colors.length]
    })).filter(d => !isNaN(d.x) && !isNaN(d.y))
  }, [data, colors])

  // 計算比例尺
  const scales = useMemo(() => {
    if (!processedData.length) return null

    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // X 軸比例尺
    const xValues = processedData.map(d => d.x)
    const xScale = d3.scaleLinear()
      .domain(d3.extent(xValues) as [number, number])
      .nice()
      .range([0, chartWidth])

    // Y 軸比例尺
    const yValues = processedData.map(d => d.y)
    const yScale = d3.scaleLinear()
      .domain(d3.extent(yValues) as [number, number])
      .nice()
      .range([chartHeight, 0])

    // 大小比例尺（如果有 size 數據）
    const hasSizeData = processedData.some(d => d.size !== undefined)
    let sizeScale = null
    
    if (hasSizeData) {
      const sizeValues = processedData.map(d => d.size || 0)
      sizeScale = d3.scaleLinear()
        .domain(d3.extent(sizeValues) as [number, number])
        .range([minRadius, maxRadius])
    }

    return { xScale, yScale, sizeScale, chartWidth, chartHeight }
  }, [processedData, width, height, margin, minRadius, maxRadius])

  // 計算趨勢線
  const trendLine = useMemo(() => {
    if (!showTrendLine || !processedData.length || !scales) return null

    const { xScale, yScale } = scales
    
    // 線性回歸計算
    const n = processedData.length
    const sumX = processedData.reduce((sum, d) => sum + d.x, 0)
    const sumY = processedData.reduce((sum, d) => sum + d.y, 0)
    const sumXY = processedData.reduce((sum, d) => sum + d.x * d.y, 0)
    const sumXX = processedData.reduce((sum, d) => sum + d.x * d.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    if (isNaN(slope) || isNaN(intercept)) return null

    const xDomain = xScale.domain()
    const x1 = xDomain[0]
    const y1 = slope * x1 + intercept
    const x2 = xDomain[1]
    const y2 = slope * x2 + intercept

    return {
      x1: xScale(x1),
      y1: yScale(y1),
      x2: xScale(x2),
      y2: yScale(y2),
      slope,
      intercept
    }
  }, [processedData, scales, showTrendLine])

  useEffect(() => {
    if (!svgRef.current || !scales || !processedData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { xScale, yScale, sizeScale, chartWidth, chartHeight } = scales

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 繪製網格
    if (showGrid) {
      // X軸網格線
      g.append('g')
        .attr('class', 'grid-x')
        .selectAll('line')
        .data(xScale.ticks())
        .enter()
        .append('line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1)
        .style('opacity', 0.5)

      // Y軸網格線
      g.append('g')
        .attr('class', 'grid-y')
        .selectAll('line')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1)
        .style('opacity', 0.5)
    }

    // 繪製趨勢線
    if (trendLine) {
      g.append('line')
        .attr('class', 'trend-line')
        .attr('x1', trendLine.x1)
        .attr('y1', trendLine.y1)
        .attr('x2', trendLine.x2)
        .attr('y2', trendLine.y2)
        .style('stroke', '#ef4444')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '5,5')
        .style('opacity', 0.7)
    }

    // 繪製散點
    const dots = g.selectAll('.dot')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => sizeScale ? sizeScale(d.size || 0) : dotRadius)
      .style('fill', d => d.color)
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('cursor', onDotClick ? 'pointer' : 'default')
      .style('opacity', 0.8)

    // 互動事件
    dots
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', (sizeScale ? sizeScale(d.size || 0) : dotRadius) * 1.3)
          .style('opacity', 1)
        
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          data: d
        })
      })
      .on('mouseleave', function(d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', sizeScale ? sizeScale(d.size || 0) : dotRadius)
          .style('opacity', 0.8)
        
        setTooltip(null)
      })
      .on('click', function(event, d) {
        onDotClick?.(d)
      })

    // 繪製坐標軸
    // X軸
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // Y軸
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // 軸標籤
    // X軸標籤
    svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', margin.left + chartWidth / 2)
      .attr('y', height - 10)
      .style('font-size', '14px')
      .style('fill', '#374151')
      .text(xLabel)

    // Y軸標籤
    svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + chartHeight / 2))
      .attr('y', 15)
      .style('font-size', '14px')
      .style('fill', '#374151')
      .text(yLabel)

    // 軸線樣式
    g.selectAll('.domain')
      .style('stroke', '#d1d5db')
    
    g.selectAll('.tick line')
      .style('stroke', '#e5e7eb')

  }, [processedData, scales, showGrid, showTrendLine, trendLine, dotRadius, onDotClick, margin, xLabel, yLabel])

  if (!data.length) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        無散佈圖資料可顯示
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
      
      {/* 提示框 */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          <div>X: {tooltip.data.x}</div>
          <div>Y: {tooltip.data.y}</div>
          {tooltip.data.size !== undefined && <div>大小: {tooltip.data.size}</div>}
          {tooltip.data.label && <div>標籤: {tooltip.data.label}</div>}
        </div>
      )}
    </div>
  )
}