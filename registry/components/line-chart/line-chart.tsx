import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'
import { LineChartProps, ProcessedDataPoint, LineSeriesConfig } from './types'
import './line-chart.css'

export function LineChart({
  data,
  xKey,
  yKey,
  xAccessor,
  yAccessor,
  mapping,
  seriesKey,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  strokeWidth = 2,
  curve = 'monotone',
  showDots = false,
  dotRadius = 4,
  showArea = false,
  areaOpacity = 0.1,
  showGrid = true,
  gridOpacity = 0.2,
  showTooltip = true,
  tooltipFormat,
  animate = false,
  interactive = true,
  className,
  onDataClick,
  onHover,
  ...props
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedDataPoint } | null>(null)

  // 1. 資料處理
  const { processedData, seriesData, xScale, yScale } = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing data:', data)
    }
    if (!data?.length) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No data provided to LineChart')
      }
      return { processedData: [], seriesData: [], xScale: null, yScale: null }
    }

    // 處理資料映射
    const processed = data.map((d, index) => {
      let x: any, y: any

      if (mapping) {
        x = typeof mapping.x === 'function' ? mapping.x(d) : d[mapping.x]
        y = typeof mapping.y === 'function' ? mapping.y(d) : d[mapping.y]
      } else if (xAccessor && yAccessor) {
        x = xAccessor(d)
        y = yAccessor(d)
      } else if (xKey && yKey) {
        x = d[xKey]
        y = d[yKey]
      } else {
        const keys = Object.keys(d)
        x = d[keys[0]]
        y = d[keys[1]]
      }

      return {
        x: x instanceof Date ? x : (typeof x === 'string' && !isNaN(Date.parse(x))) ? new Date(x) : x,
        y: Number(y) || 0,
        originalData: d
      }
    })

    // 按 X 軸排序
    processed.sort((a, b) => {
      if (a.x instanceof Date && b.x instanceof Date) {
        return a.x.getTime() - b.x.getTime()
      }
      return String(a.x).localeCompare(String(b.x))
    })

    // 處理多系列資料
    let series: Record<string, ProcessedDataPoint[]> = {}
    if (seriesKey) {
      // 按系列分組
      const groups = d3.group(processed, d => d.originalData[seriesKey])
      series = Object.fromEntries(groups)
    } else {
      series['default'] = processed
    }

    // 計算比例尺
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // X 軸比例尺
    const xDomain = d3.extent(processed, d => d.x) as [any, any]
    const xScale = processed[0]?.x instanceof Date
      ? d3.scaleTime().domain(xDomain).range([0, innerWidth])
      : d3.scaleLinear().domain(xDomain).range([0, innerWidth])

    // Y 軸比例尺
    const yDomain = d3.extent(processed, d => d.y) as [number, number]
    const yPadding = (yDomain[1] - yDomain[0]) * 0.1
    const yScale = d3.scaleLinear()
      .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
      .range([innerHeight, 0])

    if (process.env.NODE_ENV === 'development') {
      console.log('Data processing complete:', {
        processedData: processed,
        seriesData: series,
        xScale: xScale.domain(),
        yScale: yScale.domain()
      })
    }
    
    return { processedData: processed, seriesData: series, xScale, yScale }
  }, [data, xKey, yKey, xAccessor, yAccessor, mapping, seriesKey, width, height, margin])

  // 2. 線條生成器
  const lineGenerator = useMemo(() => {
    if (!xScale || !yScale) return null

    const line = d3.line<ProcessedDataPoint>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))

    // 設定曲線類型
    switch (curve) {
      case 'monotone':
        line.curve(d3.curveMonotoneX)
        break
      case 'cardinal':
        line.curve(d3.curveCardinal)
        break
      case 'basis':
        line.curve(d3.curveBasis)
        break
      case 'step':
        line.curve(d3.curveStep)
        break
      default:
        line.curve(d3.curveLinear)
    }

    return line
  }, [xScale, yScale, curve])

  // 3. 區域生成器
  const areaGenerator = useMemo(() => {
    if (!xScale || !yScale || !showArea) return null

    const area = d3.area<ProcessedDataPoint>()
      .x(d => xScale(d.x))
      .y0(yScale.range()[0]) // 使用 Y 軸的最小值（底部）
      .y1(d => yScale(d.y))

    switch (curve) {
      case 'monotone':
        area.curve(d3.curveMonotoneX)
        break
      case 'cardinal':
        area.curve(d3.curveCardinal)
        break
      case 'basis':
        area.curve(d3.curveBasis)
        break
      case 'step':
        area.curve(d3.curveStep)
        break
      default:
        area.curve(d3.curveLinear)
    }

    return area
  }, [xScale, yScale, curve, showArea])

  // 4. D3 渲染
  useEffect(() => {
    if (!svgRef.current || !xScale || !yScale || !lineGenerator) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Missing dependencies for Line Chart rendering:', {
          svgRef: !!svgRef.current,
          xScale: !!xScale,
          yScale: !!yScale,
          lineGenerator: !!lineGenerator
        })
      }
      return
    }

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
    if (showGrid) {
      // X 軸網格線
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
        .attr('stroke-opacity', gridOpacity)

      // Y 軸網格線
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
        .attr('stroke-opacity', gridOpacity)
    }

    // 繪製系列
    const seriesKeys = Object.keys(seriesData)
    seriesKeys.forEach((key, index) => {
      const seriesColor = colors[index % colors.length]
      const seriesPoints = seriesData[key]

      if (!seriesPoints?.length) return

      // 區域填充
      if (showArea && areaGenerator) {
        g.append('path')
          .datum(seriesPoints)
          .attr('class', `area-${key}`)
          .attr('d', areaGenerator)
          .attr('fill', seriesColor)
          .attr('fill-opacity', areaOpacity)
      }

      // 線條
      if (process.env.NODE_ENV === 'development') {
        console.log(`Drawing line for series ${key} with ${seriesPoints.length} points`)
        console.log('Line generator result:', lineGenerator(seriesPoints))
      }
      
      const line = g.append('path')
        .datum(seriesPoints)
        .attr('class', `line-${key}`)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', seriesColor)
        .attr('stroke-width', strokeWidth)
        .style('stroke', seriesColor)
        .style('stroke-width', strokeWidth)
        .style('fill', 'none')

      // 動畫
      if (animate) {
        const totalLength = (line.node() as SVGPathElement).getTotalLength()
        line
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1500)
          .attr('stroke-dashoffset', 0)
      }

      // 資料點
      if (showDots) {
        g.selectAll(`.dot-${key}`)
          .data(seriesPoints)
          .enter()
          .append('circle')
          .attr('class', `dot-${key}`)
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', animate ? 0 : dotRadius)
          .attr('fill', seriesColor)
          .attr('stroke', 'white')
          .attr('stroke-width', 2)

        if (animate) {
          g.selectAll(`.dot-${key}`)
            .transition()
            .delay((d, i) => i * 50)
            .duration(300)
            .attr('r', dotRadius)
        }
      }

      // 互動
      if (interactive) {
        // 建立不可見的互動區域
        g.selectAll(`.interact-${key}`)
          .data(seriesPoints)
          .enter()
          .append('circle')
          .attr('class', `interact-${key}`)
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', Math.max(dotRadius * 2, 8))
          .attr('fill', 'transparent')
          .style('cursor', 'pointer')
          .on('mouseenter', function(event, d) {
            d3.select(this).attr('fill', seriesColor).attr('fill-opacity', 0.1)
            
            if (showTooltip) {
              setTooltip({ 
                x: 0, 
                y: 0, 
                data: d 
              })
            }
            
            onHover?.(d.originalData)
          })
          .on('mouseleave', function() {
            d3.select(this).attr('fill', 'transparent')
            setTooltip(null)
          })
          .on('click', function(event, d) {
            onDataClick?.(d.originalData)
          })
      }
    })

    // X 軸
    const xAxis = d3.axisBottom(xScale)
    if (processedData[0]?.x instanceof Date) {
      xAxis.tickFormat(d3.timeFormat('%m/%d') as any)
    }

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
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
    processedData, seriesData, xScale, yScale, lineGenerator, areaGenerator,
    width, height, margin, colors, strokeWidth, showDots, dotRadius,
    showArea, areaOpacity, showGrid, gridOpacity, animate, interactive,
    onDataClick, onHover, showTooltip
  ])

  return (
    <div 
      ref={containerRef} 
      className={cn("relative line-chart", className)} 
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
              <div>X: {tooltip.data.x instanceof Date ? tooltip.data.x.toLocaleDateString() : tooltip.data.x}</div>
              <div>Y: {tooltip.data.y.toFixed(2)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LineChart