import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { BarChartProps } from '../../bar-chart/types'
import { measureMaxLabelWidth } from '../utils/text-measurement'

// 簡化版本的 BarChart 用於測試
export function BarChartSimple({
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
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  animate = false,
  interactive = true,
  showTooltip = true,
  className,
  onDataClick,
  onHover,
  ...props
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any } | null>(null)

  // 簡化的資料處理
  const processedData = useMemo(() => {
    if (!data?.length) return []

    return data.map((d, index) => {
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
        // 自動偵測：假設第一個字串欄位是 x，第一個數字欄位是 y
        const keys = Object.keys(d)
        const stringKey = keys.find(k => typeof d[k] === 'string')
        const numberKey = keys.find(k => typeof d[k] === 'number')
        x = stringKey ? d[stringKey] : d[keys[0]]
        y = numberKey ? d[numberKey] : d[keys[1]]
      }

      return {
        x,
        y: Number(y) || 0,
        originalData: d,
        index
      }
    }).filter(d => d.x != null && d.y != null)
  }, [data, xKey, yKey, xAccessor, yAccessor, mapping])

  console.log('Simple BarChart processed data:', processedData)

  // 動態計算 Y 軸標籤寬度
  const dynamicMargin = useMemo(() => {
    if (!processedData.length) return margin

    const isVertical = orientation === 'vertical'
    if (!isVertical) return margin // 水平圖表不需要調整

    // 計算 Y 軸最大值來估算標籤寬度
    const yValues = processedData.map(d => d.y)
    const maxValue = d3.max(yValues) || 0
    
    // 創建臨時比例尺來獲取刻度值
    const tempScale = d3.scaleLinear()
      .domain([0, maxValue])
      .nice()
    
    const ticks = tempScale.ticks()
    
    // 精確測量最寬標籤的寬度
    const maxLabelWidth = measureMaxLabelWidth(ticks, 12)
    
    // 確保左邊距至少能容納最寬的標籤
    const minLeftMargin = Math.max(margin.left, maxLabelWidth + 15) // 15px 額外空間
    
    return {
      ...margin,
      left: minLeftMargin
    }
  }, [processedData, orientation, margin])

  // 計算圖表尺寸
  const chartWidth = width - dynamicMargin.left - dynamicMargin.right
  const chartHeight = height - dynamicMargin.top - dynamicMargin.bottom

  // 創建比例尺
  const scales = useMemo(() => {
    if (!processedData.length) return null

    const isVertical = orientation === 'vertical'
    const xValues = processedData.map(d => String(d.x))
    const yValues = processedData.map(d => d.y)

    let xScale: any, yScale: any

    if (isVertical) {
      xScale = d3.scaleBand()
        .domain(xValues)
        .range([0, chartWidth])
        .padding(0.1)

      yScale = d3.scaleLinear()
        .domain([0, d3.max(yValues) || 0])
        .nice()
        .range([chartHeight, 0])
    } else {
      xScale = d3.scaleLinear()
        .domain([0, d3.max(yValues) || 0])
        .nice()
        .range([0, chartWidth])

      yScale = d3.scaleBand()
        .domain(xValues)
        .range([0, chartHeight])
        .padding(0.1)
    }

    return { xScale, yScale }
  }, [processedData, chartWidth, chartHeight, orientation])

  // 渲染圖表
  useEffect(() => {
    if (!svgRef.current || !scales || !processedData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg
      .append('g')
      .attr('transform', `translate(${dynamicMargin.left},${dynamicMargin.top})`)

    const { xScale, yScale } = scales
    const isVertical = orientation === 'vertical'

    // 繪製柱子
    const bars = g.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .style('cursor', interactive ? 'pointer' : 'default')
      .style('fill', (d, i) => colors[i % colors.length])

    if (isVertical) {
      bars
        .attr('x', d => xScale(String(d.x)) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(d.y))
        .attr('height', d => chartHeight - yScale(d.y))
    } else {
      bars
        .attr('x', 0)
        .attr('width', d => xScale(d.y))
        .attr('y', d => yScale(String(d.x)) || 0)
        .attr('height', yScale.bandwidth())
    }

    // 互動事件
    if (interactive) {
      bars
        .on('mouseenter', function(event, d) {
          d3.select(this).style('opacity', 0.8)
          
          if (showTooltip) {
            setTooltip({
              x: event.clientX,
              y: event.clientY,
              data: d
            })
          }
          
          onHover?.(d.originalData)
        })
        .on('mousemove', function(event, d) {
          if (showTooltip) {
            setTooltip({
              x: event.clientX,
              y: event.clientY,
              data: d
            })
          }
        })
        .on('mouseleave', function() {
          d3.select(this).style('opacity', 1)
          setTooltip(null)
        })
        .on('click', function(event, d) {
          onDataClick?.(d.originalData)
        })
    }

    // 繪製軸線
    const xAxis = isVertical ? d3.axisBottom(xScale) : d3.axisBottom(xScale)
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    const yAxis = isVertical ? d3.axisLeft(yScale) : d3.axisLeft(yScale)
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // 樣式調整
    g.selectAll('.domain')
      .style('stroke', '#d1d5db')
    
    g.selectAll('.tick line')
      .style('stroke', '#e5e7eb')

  }, [processedData, scales, chartWidth, chartHeight, orientation, colors, interactive, showTooltip, onDataClick, onHover, dynamicMargin, tooltip])

  return (
    <div className={cn('relative', className)} {...props}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
      
      {/* 簡單的提示框 */}
      {tooltip && showTooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 text-xs bg-gray-800 text-white rounded shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          <div>{tooltip.data.x}: {tooltip.data.y}</div>
        </div>
      )}
    </div>
  )
}