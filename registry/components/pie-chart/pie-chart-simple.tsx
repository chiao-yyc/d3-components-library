import React, { useRef, useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { cn } from '../../utils/cn'

export interface SimplePieChartData {
  label: string
  value: number
  color?: string
}

export interface SimplePieChartProps {
  data: SimplePieChartData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colors?: string[]
  innerRadius?: number
  outerRadius?: number
  showLabels?: boolean
  showValues?: boolean
  showPercentages?: boolean
  showLegend?: boolean
  legendPosition?: 'right' | 'bottom'
  className?: string
  onSliceClick?: (data: SimplePieChartData) => void
}

export function SimplePieChart({
  data,
  width = 400,
  height = 400,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
  innerRadius = 0,
  outerRadius,
  showLabels = true,
  showValues = false,
  showPercentages = true,
  showLegend = true,
  legendPosition = 'right',
  className,
  onSliceClick
}: SimplePieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: SimplePieChartData } | null>(null)

  // 處理數據
  const processedData = useMemo(() => {
    if (!data?.length) return []

    const total = data.reduce((sum, d) => sum + d.value, 0)
    
    return data.map((d, index) => ({
      ...d,
      value: Number(d.value) || 0,
      percentage: total > 0 ? (d.value / total) * 100 : 0,
      color: d.color || colors[index % colors.length]
    })).filter(d => d.value > 0)
  }, [data, colors])

  // 計算佈局
  const layout = useMemo(() => {
    const legendWidth = showLegend && legendPosition === 'right' ? 150 : 0
    const legendHeight = showLegend && legendPosition === 'bottom' ? 80 : 0
    
    const chartWidth = width - margin.left - margin.right - legendWidth
    const chartHeight = height - margin.top - margin.bottom - legendHeight
    
    const radius = outerRadius || Math.min(chartWidth, chartHeight) / 2 - 10
    const centerX = margin.left + chartWidth / 2
    const centerY = margin.top + chartHeight / 2

    return {
      chartWidth,
      chartHeight,
      radius,
      centerX,
      centerY,
      legendWidth,
      legendHeight
    }
  }, [width, height, margin, outerRadius, showLegend, legendPosition])

  useEffect(() => {
    if (!svgRef.current || !processedData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { radius, centerX, centerY } = layout

    // 創建餅圖生成器
    const pie = d3.pie<any>()
      .value(d => d.value)
      .sort(null)

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)

    const labelArc = d3.arc()
      .innerRadius(radius + 10)
      .outerRadius(radius + 10)

    // 生成餅圖數據
    const pieData = pie(processedData)

    // 主繪圖組
    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`)

    // 繪製餅圖切片
    const slices = g.selectAll('.slice')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'slice')
      .style('cursor', onSliceClick ? 'pointer' : 'default')

    // 切片路徑
    slices.append('path')
      .attr('d', arc as any)
      .style('fill', d => d.data.color)
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', 0.8)
        
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          data: d.data
        })
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', 1)
        
        setTooltip(null)
      })
      .on('click', function(event, d) {
        onSliceClick?.(d.data)
      })

    // 標籤
    if (showLabels) {
      slices.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d as any)})`)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#374151')
        .text(d => {
          if (d.endAngle - d.startAngle < 0.3) return '' // 太小的切片不顯示標籤
          
          let text = d.data.label
          if (showValues) text += `: ${d.data.value}`
          if (showPercentages) text += ` (${d.data.percentage.toFixed(1)}%)`
          
          return text
        })
        .call(wrapText, 80) // 文字換行
    }

    // 圖例
    if (showLegend) {
      const legend = svg.append('g')
        .attr('class', 'legend')

      if (legendPosition === 'right') {
        legend.attr('transform', `translate(${width - layout.legendWidth + 10}, ${margin.top})`)
        
        const legendItems = legend.selectAll('.legend-item')
          .data(processedData)
          .enter()
          .append('g')
          .attr('class', 'legend-item')
          .attr('transform', (d, i) => `translate(0, ${i * 20})`)

        legendItems.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .style('fill', d => d.color)

        legendItems.append('text')
          .attr('x', 18)
          .attr('y', 9)
          .style('font-size', '12px')
          .style('fill', '#374151')
          .text(d => d.label)
          
      } else if (legendPosition === 'bottom') {
        legend.attr('transform', `translate(${margin.left}, ${height - layout.legendHeight + 10})`)
        
        const itemsPerRow = Math.floor(layout.chartWidth / 120)
        
        const legendItems = legend.selectAll('.legend-item')
          .data(processedData)
          .enter()
          .append('g')
          .attr('class', 'legend-item')
          .attr('transform', (d, i) => {
            const row = Math.floor(i / itemsPerRow)
            const col = i % itemsPerRow
            return `translate(${col * 120}, ${row * 20})`
          })

        legendItems.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .style('fill', d => d.color)

        legendItems.append('text')
          .attr('x', 18)
          .attr('y', 9)
          .style('font-size', '12px')
          .style('fill', '#374151')
          .text(d => d.label)
      }
    }

  }, [processedData, layout, innerRadius, showLabels, showValues, showPercentages, showLegend, legendPosition, onSliceClick])

  if (!data.length) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        無餅圖資料可顯示
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
          <div>{tooltip.data.label}</div>
          <div>值: {tooltip.data.value}</div>
          <div>比例: {tooltip.data.percentage.toFixed(1)}%</div>
        </div>
      )}
    </div>
  )
}

// 文字換行輔助函數
function wrapText(text: any, width: number) {
  text.each(function() {
    const text = d3.select(this)
    const words = text.text().split(/\s+/).reverse()
    let word
    let line: string[] = []
    let lineNumber = 0
    const lineHeight = 1.1
    const y = text.attr('y')
    const dy = parseFloat(text.attr('dy') || '0')
    let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em')
    
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(' '))
      if (tspan.node()!.getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(' '))
        line = [word]
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word)
      }
    }
  })
}