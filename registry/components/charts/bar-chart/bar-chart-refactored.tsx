import React, { useRef, useEffect, useMemo } from 'react'
import * as d3 from 'd3'
import { cn } from '../../../utils/cn'
import { BarChartProps } from '../../bar-chart/types'

// 使用新的核心模組
import { useDataProcessor } from '../../core/data-processor'
import { useColorScheme } from '../../core/color-scheme'
import { useTooltip, getPositionFromEvent } from '../../ui/chart-tooltip'
import { SimpleTooltip, formatTooltipContent } from '../../ui/chart-tooltip/simple-tooltip'
import { measureMaxLabelWidth } from '../utils/text-measurement'

export function BarChartRefactored({
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
  colors,
  colorScheme = 'custom',
  animate = false,
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  className,
  onDataClick,
  onHover,
  ...props
}: BarChartProps & { colorScheme?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 使用 data-processor 核心模組
  const { data: processedData, mapping: resolvedMapping, statistics, errors, warnings } = useDataProcessor(data, {
    mapping,
    accessors: { xAccessor, yAccessor },
    keys: { xKey, yKey },
    autoDetect: true,
    removeNulls: true,
    parseNumbers: true
  })

  // 調試資訊
  console.log('BarChart Debug:', {
    rawData: data,
    processedData,
    resolvedMapping,
    statistics,
    errors,
    warnings
  })
  
  // 詳細調試
  if (processedData.length > 0) {
    console.log('First processed item:', processedData[0])
    console.log('Y values:', processedData.map(d => d.y))
  }

  // 使用 color-scheme 核心模組
  const { getColor, colors: chartColors } = useColorScheme({
    type: colorScheme as any,
    colors,
    count: processedData.length,
    data: processedData
  })

  // 使用 chart-tooltip 模組
  const { tooltip, showTooltip: showTooltipFn, hideTooltip, updateTooltip } = useTooltip({
    hideDelay: 100
  })

  // 動態計算 Y 軸標籤寬度
  const dynamicMargin = useMemo(() => {
    if (!processedData.length) return margin

    const isVertical = orientation === 'vertical'
    if (!isVertical) return margin // 水平圖表不需要調整

    // 計算 Y 軸最大值來估算標籤寬度
    const yValues = processedData.map(d => d.y).filter(v => typeof v === 'number')
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
    const xValues = processedData.map(d => d.x)
    const yValues = processedData.map(d => d.y).filter(v => typeof v === 'number')

    let xScale: any, yScale: any

    if (isVertical) {
      // 垂直柱狀圖：X 軸是類別，Y 軸是數值
      xScale = d3.scaleBand()
        .domain(xValues.map(String))
        .range([0, chartWidth])
        .padding(0.1)

      yScale = d3.scaleLinear()
        .domain([0, d3.max(yValues) || 0])
        .nice()
        .range([chartHeight, 0])
    } else {
      // 水平柱狀圖：X 軸是數值，Y 軸是類別
      xScale = d3.scaleLinear()
        .domain([0, d3.max(yValues) || 0])
        .nice()
        .range([0, chartWidth])

      yScale = d3.scaleBand()
        .domain(xValues.map(String))
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

    // 創建主要繪圖區域
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

    if (isVertical) {
      bars
        .attr('x', d => xScale(String(d.x)) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', chartHeight)
        .attr('height', 0)
        .style('fill', (d, i) => getColor(d, i))
    } else {
      bars
        .attr('x', 0)
        .attr('width', 0)
        .attr('y', d => yScale(String(d.x)) || 0)
        .attr('height', yScale.bandwidth())
        .style('fill', (d, i) => getColor(d, i))
    }

    // 動畫效果
    if (animate) {
      if (isVertical) {
        bars.transition()
          .duration(800)
          .ease(d3.easeQuadOut)
          .attr('y', d => yScale(d.y))
          .attr('height', d => chartHeight - yScale(d.y))
      } else {
        bars.transition()
          .duration(800)
          .ease(d3.easeQuadOut)
          .attr('width', d => xScale(d.y))
      }
    } else {
      if (isVertical) {
        bars
          .attr('y', d => yScale(d.y))
          .attr('height', d => chartHeight - yScale(d.y))
      } else {
        bars
          .attr('width', d => xScale(d.y))
      }
    }

    // 互動事件
    if (interactive) {
      bars
        .on('mouseenter', function(event, d) {
          d3.select(this).style('opacity', 0.8)
          
          if (showTooltip) {
            const position = getPositionFromEvent(event)
            const tooltipData = {
              data: d,
              series: 'Bar Chart'
            }
            showTooltipFn(position, tooltipData)
          }
          
          onHover?.(d.originalData)
        })
        .on('mousemove', function(event, d) {
          if (showTooltip) {
            const position = getPositionFromEvent(event)
            const tooltipData = {
              data: d,
              series: 'Bar Chart'
            }
            showTooltipFn(position, tooltipData)
          }
        })
        .on('mouseleave', function() {
          d3.select(this).style('opacity', 1)
          hideTooltip()
        })
        .on('click', function(event, d) {
          onDataClick?.(d.originalData)
        })
    }

    // 繪製 X 軸
    const xAxis = isVertical ? d3.axisBottom(xScale) : d3.axisBottom(xScale)
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')

    // 繪製 Y 軸
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

  }, [processedData, scales, chartWidth, chartHeight, orientation, animate, interactive, showTooltip, getColor, onDataClick, onHover, dynamicMargin, showTooltipFn, hideTooltip, updateTooltip, tooltip.visible])

  return (
    <div 
      ref={containerRef}
      className={cn('relative', className)} 
      {...props}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
      
      {/* 使用簡化的模組化 Tooltip */}
      <SimpleTooltip
        visible={tooltip.visible && tooltip.data != null}
        x={tooltip.position.x}
        y={tooltip.position.y}
        content={
          tooltip.data ? formatTooltipContent(
            String(tooltip.data.data.x),
            tooltip.data.data.y
          ) : null
        }
        theme="dark"
      />
    </div>
  )
}