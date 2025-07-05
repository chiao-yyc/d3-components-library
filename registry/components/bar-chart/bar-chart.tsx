import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'
import { BarChartProps, ProcessedDataPoint } from './types'

export function BarChart({
  data,
  xKey,
  yKey,
  xAccessor,
  yAccessor,
  mapping,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  orientation = 'vertical',
  colors = ['#3b82f6'],
  animate = false,
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  className,
  onDataClick,
  onHover,
  ...props
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProcessedDataPoint } | null>(null)

  // 1. 資料處理
  const processedData = useMemo(() => {
    if (!data?.length) return []

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
        // 自動偵測：假設第一個欄位是 x，第二個是 y
        const keys = Object.keys(d)
        x = d[keys[0]]
        y = d[keys[1]]
      }

      return {
        x,
        y: +y, // 確保 y 是數字
        originalData: d,
        index
      } as ProcessedDataPoint
    })
    
    const result = processed.filter(d => !isNaN(d.y)) // 過濾無效資料
    return result
  }, [data, xKey, yKey, xAccessor, yAccessor, mapping])

  // 2. 比例尺計算
  const scales = useMemo(() => {
    if (!processedData.length) return null

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>
    let yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>

    if (orientation === 'vertical') {
      // 垂直長條圖
      xScale = d3.scaleBand()
        .domain(processedData.map(d => String(d.x)))
        .range([0, innerWidth])
        .padding(0.1)

      yScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.y) || 0])
        .range([innerHeight, 0])
        .nice()
    } else {
      // 水平長條圖
      xScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.y) || 0])
        .range([0, innerWidth])
        .nice()

      yScale = d3.scaleBand()
        .domain(processedData.map(d => String(d.x)))
        .range([0, innerHeight])
        .padding(0.1)
    }

    return { xScale, yScale, innerWidth, innerHeight }
  }, [processedData, width, height, margin, orientation])

  // 3. D3 渲染
  useEffect(() => {
    if (!svgRef.current || !scales || !processedData.length) return

    const svg = d3.select(svgRef.current)
    const { xScale, yScale, innerWidth, innerHeight } = scales

    // 清除之前的內容
    svg.selectAll('*').remove()

    // 創建主要群組
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 繪製長條
    const bars = g.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .style('fill', (d, i) => colors[i % colors.length])

    if (orientation === 'vertical') {
      bars
        .attr('x', d => (xScale as d3.ScaleBand<string>)(String(d.x)) || 0)
        .attr('width', (xScale as d3.ScaleBand<string>).bandwidth())
        .attr('y', animate ? innerHeight : d => (yScale as d3.ScaleLinear<number, number>)(d.y))
        .attr('height', animate ? 0 : d => innerHeight - (yScale as d3.ScaleLinear<number, number>)(d.y))
    } else {
      bars
        .attr('x', 0)
        .attr('y', d => (yScale as d3.ScaleBand<string>)(String(d.x)) || 0)
        .attr('width', animate ? 0 : d => (xScale as d3.ScaleLinear<number, number>)(d.y))
        .attr('height', (yScale as d3.ScaleBand<string>).bandwidth())
    }

    // 動畫效果
    if (animate) {
      if (orientation === 'vertical') {
        bars.transition()
          .duration(750)
          .attr('y', d => (yScale as d3.ScaleLinear<number, number>)(d.y))
          .attr('height', d => innerHeight - (yScale as d3.ScaleLinear<number, number>)(d.y))
      } else {
        bars.transition()
          .duration(750)
          .attr('width', d => (xScale as d3.ScaleLinear<number, number>)(d.y))
      }
    }

    // 互動事件
    if (interactive) {
      bars
        .style('cursor', 'pointer')
        .on('click', function(event, d) {
          onDataClick?.(d.originalData)
        })
        .on('mouseenter', function(event, d) {
          d3.select(this).style('opacity', 0.8)
          
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
          d3.select(this).style('opacity', 1)
          setTooltip(null)
        })
    }

    // X 軸
    const xAxis = orientation === 'vertical' 
      ? d3.axisBottom(xScale as d3.ScaleBand<string>)
      : d3.axisBottom(xScale as d3.ScaleLinear<number, number>)

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)

    // Y 軸
    const yAxis = orientation === 'vertical'
      ? d3.axisLeft(yScale as d3.ScaleLinear<number, number>)
      : d3.axisLeft(yScale as d3.ScaleBand<string>)

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)

  }, [scales, processedData, margin, orientation, colors, animate, interactive, onDataClick, onHover, showTooltip, tooltipFormat])

  // 4. 響應式處理
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      // 這裡可以實作響應式邏輯
      // 目前先使用固定尺寸
    })

    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  if (!data?.length) {
    return (
      <div className={cn('bar-chart-container', className)} {...props}>
        <div className="empty-state">
          <p>無資料可顯示</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('bar-chart-container relative', className)}
      onMouseLeave={() => setTooltip(null)}
      {...props}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bar-chart-svg"
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
              <div>X: {tooltip.data.x}</div>
              <div>Y: {tooltip.data.y}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}