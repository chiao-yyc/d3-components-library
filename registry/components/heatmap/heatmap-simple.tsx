import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'

export interface SimpleHeatmapData {
  x: string | number
  y: string | number
  value: number
  label?: string
}

export interface SimpleHeatmapProps {
  data: SimpleHeatmapData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colorScheme?: 'blues' | 'reds' | 'greens' | 'purples' | 'oranges' | 'viridis'
  showValues?: boolean
  showAxisLabels?: boolean
  cellPadding?: number
  className?: string
  onCellClick?: (data: SimpleHeatmapData) => void
}

export function SimpleHeatmap({
  data,
  width = 600,
  height = 400,
  margin = { top: 40, right: 20, bottom: 60, left: 80 },
  colorScheme = 'blues',
  showValues = true,
  showAxisLabels = true,
  cellPadding = 1,
  className,
  onCellClick
}: SimpleHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: SimpleHeatmapData } | null>(null)

  // 處理數據
  const processedData = useMemo(() => {
    if (!data?.length) return { data: [], xValues: [], yValues: [], valueExtent: [0, 0] }

    // 獲取所有唯一的 x 和 y 值
    const xValues = [...new Set(data.map(d => String(d.x)))].sort()
    const yValues = [...new Set(data.map(d => String(d.y)))].sort()
    
    // 創建完整的網格數據
    const gridData: SimpleHeatmapData[] = []
    yValues.forEach(y => {
      xValues.forEach(x => {
        const existingData = data.find(d => String(d.x) === x && String(d.y) === y)
        gridData.push({
          x,
          y,
          value: existingData ? Number(existingData.value) || 0 : 0,
          label: existingData?.label
        })
      })
    })

    // 計算值的範圍
    const values = gridData.map(d => d.value)
    const valueExtent = d3.extent(values) as [number, number]

    return { data: gridData, xValues, yValues, valueExtent }
  }, [data])

  // 顏色比例尺
  const colorScale = useMemo(() => {
    const { valueExtent } = processedData
    
    const colorSchemes = {
      blues: d3.interpolateBlues,
      reds: d3.interpolateReds,
      greens: d3.interpolateGreens,
      purples: d3.interpolatePurples,
      oranges: d3.interpolateOranges,
      viridis: d3.interpolateViridis
    }

    return d3.scaleSequential(colorSchemes[colorScheme])
      .domain(valueExtent)
  }, [processedData, colorScheme])

  // 計算佈局
  const layout = useMemo(() => {
    const { xValues, yValues } = processedData
    
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    
    const cellWidth = chartWidth / xValues.length
    const cellHeight = chartHeight / yValues.length

    return { chartWidth, chartHeight, cellWidth, cellHeight }
  }, [processedData, width, height, margin])

  useEffect(() => {
    if (!svgRef.current || !processedData.data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { xValues, yValues } = processedData
    const { chartWidth, chartHeight, cellWidth, cellHeight } = layout

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 創建 X 和 Y 比例尺
    const xScale = d3.scaleBand()
      .domain(xValues)
      .range([0, chartWidth])
      .padding(0)

    const yScale = d3.scaleBand()
      .domain(yValues)
      .range([0, chartHeight])
      .padding(0)

    // 繪製熱力圖單元格
    const cells = g.selectAll('.cell')
      .data(processedData.data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(String(d.x))! + cellPadding / 2)
      .attr('y', d => yScale(String(d.y))! + cellPadding / 2)
      .attr('width', cellWidth - cellPadding)
      .attr('height', cellHeight - cellPadding)
      .style('fill', d => colorScale(d.value))
      .style('stroke', '#fff')
      .style('stroke-width', cellPadding)
      .style('cursor', onCellClick ? 'pointer' : 'default')

    // 互動事件
    cells
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .style('stroke', '#333')
          .style('stroke-width', 2)
        
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          data: d
        })
      })
      .on('mouseleave', function() {
        d3.select(this)
          .style('stroke', '#fff')
          .style('stroke-width', cellPadding)
        
        setTooltip(null)
      })
      .on('click', function(event, d) {
        onCellClick?.(d)
      })

    // 顯示數值
    if (showValues) {
      g.selectAll('.cell-text')
        .data(processedData.data)
        .enter()
        .append('text')
        .attr('class', 'cell-text')
        .attr('x', d => xScale(String(d.x))! + cellWidth / 2)
        .attr('y', d => yScale(String(d.y))! + cellHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', Math.min(cellWidth, cellHeight) / 4 + 'px')
        .style('fill', d => {
          // 根據背景顏色選擇文字顏色
          const brightness = d3.hsl(colorScale(d.value)).l
          return brightness > 0.5 ? '#000' : '#fff'
        })
        .style('pointer-events', 'none')
        .text(d => d.value.toFixed(1))
    }

    // 繪製坐標軸
    if (showAxisLabels) {
      // X軸
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#6b7280')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')

      // Y軸
      g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#6b7280')
    }

    // 移除軸線
    g.selectAll('.domain').remove()
    g.selectAll('.tick line').remove()

    // 繪製顏色圖例
    const legendWidth = 20
    const legendHeight = chartHeight / 2
    const legendX = chartWidth + 10
    const legendY = chartHeight / 4

    const legendScale = d3.scaleLinear()
      .domain(processedData.valueExtent)
      .range([legendHeight, 0])

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'))

    // 漸變定義
    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%').attr('y1', '100%')
      .attr('x2', '0%').attr('y2', '0%')

    const steps = 10
    for (let i = 0; i <= steps; i++) {
      const percent = (i / steps) * 100
      const value = processedData.valueExtent[0] + (i / steps) * (processedData.valueExtent[1] - processedData.valueExtent[0])
      gradient.append('stop')
        .attr('offset', percent + '%')
        .attr('stop-color', colorScale(value))
    }

    // 圖例矩形
    g.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')
      .style('stroke', '#ccc')

    // 圖例軸
    g.append('g')
      .attr('transform', `translate(${legendX + legendWidth}, ${legendY})`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#6b7280')

  }, [processedData, layout, colorScale, showValues, showAxisLabels, cellPadding, onCellClick, margin])

  if (!data.length) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        無熱力圖資料可顯示
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
          <div>值: {tooltip.data.value}</div>
          {tooltip.data.label && <div>標籤: {tooltip.data.label}</div>}
        </div>
      )}
    </div>
  )
}