import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'

export interface SimpleLineChartData {
  x: string | number | Date
  y: number
  series?: string
}

export interface SimpleLineChartProps {
  data: SimpleLineChartData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colors?: string[]
  strokeWidth?: number
  showDots?: boolean
  dotRadius?: number
  showArea?: boolean
  showGrid?: boolean
  curve?: 'linear' | 'monotone' | 'step'
  className?: string
  onDataClick?: (data: SimpleLineChartData) => void
}

export function SimpleLineChart({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 50 },
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  strokeWidth = 2,
  showDots = false,
  dotRadius = 4,
  showArea = false,
  showGrid = true,
  curve = 'monotone',
  className,
  onDataClick
}: SimpleLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: SimpleLineChartData } | null>(null)

  // 處理數據
  const processedData = useMemo(() => {
    if (!data?.length) return { seriesData: [], allData: [] }

    // 按系列分組數據
    const seriesMap = new Map<string, SimpleLineChartData[]>()
    
    data.forEach(d => {
      const seriesKey = d.series || 'default'
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, [])
      }
      seriesMap.get(seriesKey)!.push({
        ...d,
        x: d.x instanceof Date ? d.x : (typeof d.x === 'string' ? new Date(d.x) : d.x),
        y: Number(d.y) || 0
      })
    })

    // 對每個系列按 x 值排序
    const seriesData = Array.from(seriesMap.entries()).map(([key, values]) => ({
      key,
      values: values.sort((a, b) => {
        if (a.x instanceof Date && b.x instanceof Date) {
          return a.x.getTime() - b.x.getTime()
        }
        return Number(a.x) - Number(b.x)
      })
    }))

    return { seriesData, allData: data }
  }, [data])

  // 計算比例尺
  const scales = useMemo(() => {
    if (!processedData.allData.length) return null

    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // X 軸比例尺
    const xValues = processedData.allData.map(d => d.x)
    const isDateScale = xValues[0] instanceof Date
    
    let xScale: any
    if (isDateScale) {
      const extent = d3.extent(xValues as Date[]) as [Date, Date]
      xScale = d3.scaleTime()
        .domain(extent)
        .range([0, chartWidth])
    } else {
      const extent = d3.extent(xValues as number[]) as [number, number]
      xScale = d3.scaleLinear()
        .domain(extent)
        .range([0, chartWidth])
    }

    // Y 軸比例尺
    const yValues = processedData.allData.map(d => d.y)
    const yScale = d3.scaleLinear()
      .domain(d3.extent(yValues) as [number, number])
      .nice()
      .range([chartHeight, 0])

    return { xScale, yScale, chartWidth, chartHeight, isDateScale }
  }, [processedData.allData, width, height, margin])

  useEffect(() => {
    if (!svgRef.current || !scales || !processedData.seriesData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { xScale, yScale, chartWidth, chartHeight, isDateScale } = scales

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 繪製網格
    if (showGrid) {
      // Y軸網格線
      g.append('g')
        .attr('class', 'grid')
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

    // 曲線生成器
    const curveType = curve === 'monotone' ? d3.curveMonotoneX :
                     curve === 'step' ? d3.curveStepAfter :
                     d3.curveLinear

    const line = d3.line<SimpleLineChartData>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(curveType)

    const area = d3.area<SimpleLineChartData>()
      .x(d => xScale(d.x))
      .y0(chartHeight)
      .y1(d => yScale(d.y))
      .curve(curveType)

    // 繪製每個系列
    processedData.seriesData.forEach((series, seriesIndex) => {
      const color = colors[seriesIndex % colors.length]

      // 繪製面積圖
      if (showArea) {
        g.append('path')
          .datum(series.values)
          .attr('d', area)
          .style('fill', color)
          .style('opacity', 0.3)
      }

      // 繪製線條
      g.append('path')
        .datum(series.values)
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', color)
        .style('stroke-width', strokeWidth)

      // 繪製數據點
      if (showDots) {
        g.selectAll(`.dots-${seriesIndex}`)
          .data(series.values)
          .enter()
          .append('circle')
          .attr('class', `dots-${seriesIndex}`)
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', dotRadius)
          .style('fill', color)
          .style('cursor', onDataClick ? 'pointer' : 'default')
          .on('mouseenter', function(event, d) {
            d3.select(this).attr('r', dotRadius * 1.5)
            setTooltip({
              x: event.clientX,
              y: event.clientY,
              data: d
            })
          })
          .on('mouseleave', function() {
            d3.select(this).attr('r', dotRadius)
            setTooltip(null)
          })
          .on('click', function(event, d) {
            onDataClick?.(d)
          })
      }
    })

    // 繪製坐標軸
    // X軸
    const xAxis = isDateScale ? 
      d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d')) :
      d3.axisBottom(xScale)
    
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
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

    // 軸線樣式
    g.selectAll('.domain')
      .style('stroke', '#d1d5db')
    
    g.selectAll('.tick line')
      .style('stroke', '#e5e7eb')

  }, [processedData, scales, showGrid, showArea, showDots, curve, strokeWidth, dotRadius, colors, onDataClick, margin])

  if (!data.length) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        無線圖資料可顯示
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
          <div>X: {tooltip.data.x instanceof Date ? tooltip.data.x.toLocaleDateString() : tooltip.data.x}</div>
          <div>Y: {tooltip.data.y}</div>
          {tooltip.data.series && <div>系列: {tooltip.data.series}</div>}
        </div>
      )}
    </div>
  )
}